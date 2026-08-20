package services

import (
	"errors"
	"net/http"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetUserSubjects(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		var subjects []models.Subject
		if err := db.Where("user_id = ?", userID).Find(&subjects).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, dto.ToSubjectListResponse(subjects, db))
	}
}

func GetSubjectByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		subjectID := c.Param("subjectID")
		var subject models.Subject

		if err := db.Where("user_id = ?", userID).First(&subject, subjectID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject, db))
	}
}

func CreateSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		var input models.SubjectInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		subject := models.Subject{Name: input.Name, UserID: userID}

		if err := validators.Validate(subject); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Create(&subject).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create subject"})
			return
		}

		c.JSON(http.StatusCreated, dto.ToSubjectResponse(subject, db))
	}
}

func UpdateSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		subjectID := c.Param("subjectID")

		var subject models.Subject
		if err := db.Where("user_id = ?", userID).First(&subject, subjectID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var input models.SubjectInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		subject.Name = input.Name
		if err := db.Save(&subject).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update subject"})
			return
		}

		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject, db))
	}
}

func DeleteSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		subjectID := c.Param("subjectID")

		var subject models.Subject
		if err := db.Where("user_id = ?", userID).First(&subject, subjectID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Exec(`
				DELETE FROM questions
				WHERE folder_id IN (SELECT id FROM folders WHERE subject_id = ?)
			`, subject.ID).Error; err != nil {
				return err
			}
			if err := tx.Where("subject_id = ?", subject.ID).Delete(&models.Folder{}).Error; err != nil {
				return err
			}
			return tx.Delete(&subject).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete subject"})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

func GetMostRecentSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var subject models.Subject
		userID := c.GetInt("userID")

		if err := db.Where("user_id = ?", userID).Order("updated_at DESC").First(&subject).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get the most recent subject"})
			return
		}

		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject, db))
	}

}
