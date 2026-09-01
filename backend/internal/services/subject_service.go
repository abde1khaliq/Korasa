package services

import (
	"errors"
	"log"
	"net/http"
	"strconv"

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
			log.Printf("failed to retrieve subjects for user %d: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve subjects"})
			return
		}
		c.JSON(http.StatusOK, dto.ToSubjectListResponse(subjects, db))
	}
}

func GetSubjectByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		subjectID, err := strconv.Atoi(c.Param("subjectID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}

		subject, err := validators.UserOwnSubject(db, subjectID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				log.Printf("failed to retrieve subject %d for user %d: %v", subjectID, userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve subject"})
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

		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		subject := models.Subject{Name: input.Name, UserID: userID}
		if err := validators.Validate(subject); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Create(&subject).Error; err != nil {
			log.Printf("failed to create subject for user %d: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create subject"})
			return
		}

		c.JSON(http.StatusCreated, dto.ToSubjectResponse(subject, db))
	}
}

func UpdateSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		subjectID, err := strconv.Atoi(c.Param("subjectID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}

		subject, err := validators.UserOwnSubject(db, subjectID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				log.Printf("failed to retrieve subject for update %d: %v", subjectID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update subject"})
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
			log.Printf("failed to update subject %d: %v", subjectID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update subject"})
			return
		}

		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject, db))
	}
}

func DeleteSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		subjectID, err := strconv.Atoi(c.Param("subjectID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}

		subject, err := validators.UserOwnSubject(db, subjectID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				log.Printf("failed to retrieve subject for deletion %d: %v", subjectID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete subject"})
			}
			return
		}

		var questions []models.Question
		if err := db.Joins("JOIN folders ON folders.id = questions.folder_id").
			Where("folders.subject_id = ?", subject.ID).
			Find(&questions).Error; err != nil {
			log.Printf("failed to fetch questions for subject %d before deletion: %v", subjectID, err)
		}

		if err := db.Delete(&subject).Error; err != nil {
			log.Printf("failed to delete subject %d: %v", subjectID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete subject"})
			return
		}

		for _, q := range questions {
			if q.ImageURL != "" {
				if err := DeleteQuestionImage(c.Request.Context(), q.ImageURL); err != nil {
					log.Printf("failed to delete image from cloudinary for question %d: %v", q.ID, err)
				}
			}
		}

		c.Status(http.StatusNoContent)
	}
}

func GetMostRecentSubject(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var subject models.Subject
		userID := c.GetInt("userID")

		if err := db.Where("user_id = ?", userID).Order("updated_at DESC").First(&subject).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "no subjects found"})
			} else {
				log.Printf("failed to retrieve most recent subject for user %d: %v", userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not get the most recent subject"})
			}
			return
		}

		c.JSON(http.StatusOK, dto.ToSubjectResponse(subject, db))
	}
}
