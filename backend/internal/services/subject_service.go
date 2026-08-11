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
		c.JSON(http.StatusOK, dto.ToSubjectListResponse(subjects))
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
		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject))
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

		c.JSON(http.StatusCreated, dto.ToSubjectResponse(subject))
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

		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject))
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

		if err := db.Delete(&subject).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete subject"})
			return
		}

		c.Status(http.StatusNoContent)
	}
}
