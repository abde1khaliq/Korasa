package services

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateQuestion(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		folderID, err := strconv.Atoi(c.Param("folderID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid folder id"})
			return
		}

		if _, err := validators.UserOwnFolder(db, folderID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "folder not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var input models.QuestionInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		question := models.Question{
			Text:       input.Text,
			Answer:     input.Answer,
			Difficulty: input.Difficulty,
			Note:       input.Note,
			FolderID:   folderID,
		}

		if err := validators.Validate(question); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := db.Create(&question).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create question"})
			return
		}

		c.JSON(http.StatusCreated, dto.ToQuestionResponse(question))
	}
}

func GetFolderQuestions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		folderID, err := strconv.Atoi(c.Param("folderID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid folder id"})
			return
		}

		if _, err := validators.UserOwnFolder(db, folderID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "folder not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var questions []models.Question
		if err := db.Where("folder_id = ?", folderID).Find(&questions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, dto.ToQuestionListResponse(questions))
	}
}

func GetQuestionByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		questionID, err := strconv.Atoi(c.Param("questionID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid question id"})
			return
		}

		var question models.Question
		if err := db.First(&question, questionID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		if _, err := validators.UserOwnFolder(db, question.FolderID, userID); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			return
		}

		c.JSON(http.StatusOK, dto.ToQuestionResponse(question))
	}
}

func UpdateQuestion(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		questionID, err := strconv.Atoi(c.Param("questionID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid question id"})
			return
		}

		var question models.Question
		if err := db.First(&question, questionID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		if _, err := validators.UserOwnFolder(db, question.FolderID, userID); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			return
		}

		var input models.QuestionInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		question.Text = input.Text
		question.Answer = input.Answer
		question.Difficulty = input.Difficulty
		question.Note = input.Note
		// FolderID intentionally never touched here — no move endpoint, same as Folder/Subject

		if err := db.Save(&question).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update question"})
			return
		}

		c.JSON(http.StatusOK, dto.ToQuestionResponse(question))
	}
}

func DeleteQuestion(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		questionID, err := strconv.Atoi(c.Param("questionID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid question id"})
			return
		}

		var question models.Question
		if err := db.First(&question, questionID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		if _, err := validators.UserOwnFolder(db, question.FolderID, userID); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			return
		}

		if err := db.Delete(&question).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete question"})
			return
		}

		c.Status(http.StatusNoContent)
	}
}
