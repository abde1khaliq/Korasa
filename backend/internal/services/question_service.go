package services

import (
	"errors"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const maxImageSizeBytes = 5 * 1024 * 1024 // 5MB

var allowedImageMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

func CreateQuestion(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		folderID, err := strconv.Atoi(c.Param("folderID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid folder id"})
			return
		}

		folder, err := validators.UserOwnFolder(db, folderID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "folder not found"})
			} else {
				log.Printf("error verifying folder ownership: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not verify folder ownership"})
			}
			return
		}

		fileHeader, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required"})
			return
		}

		if fileHeader.Size > maxImageSizeBytes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "image file exceeds maximum allowed size of 5MB"})
			return
		}

		file, err := fileHeader.Open()
		if err != nil {
			log.Printf("failed to open uploaded file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not read image"})
			return
		}
		defer file.Close()

		// Read the first 512 bytes to sniff and validate the MIME type
		buf := make([]byte, 512)
		n, err := file.Read(buf)
		if err != nil && err != io.EOF {
			log.Printf("failed to read image header: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "could not inspect image file"})
			return
		}

		mimeType := http.DetectContentType(buf[:n])
		if !allowedImageMimeTypes[mimeType] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid image type; allowed formats: JPEG, PNG, WebP, GIF"})
			return
		}

		// Reset reader position back to the beginning for upload
		if seeker, ok := file.(io.ReadSeeker); ok {
			if _, err := seeker.Seek(0, io.SeekStart); err != nil {
				log.Printf("failed to seek image: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not process image upload"})
				return
			}
		}

		imageURL, err := UploadQuestionImage(c.Request.Context(), file)
		if err != nil {
			log.Printf("failed to upload image to cloudinary: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not upload image"})
			return
		}

		question := models.Question{
			ImageURL:   imageURL,
			Text:       c.PostForm("text"),
			Answer:     c.PostForm("answer"),
			Difficulty: c.PostForm("difficulty"),
			Note:       c.PostForm("note"),
			FolderID:   folderID,
		}

		if err := validators.Validate(question); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&question).Error; err != nil {
				return err
			}
			now := time.Now()
			if err := tx.Model(&models.Folder{}).Where("id = ?", folderID).Update("updated_at", now).Error; err != nil {
				return err
			}
			return tx.Model(&models.Subject{}).Where("id = ?", folder.SubjectID).Update("updated_at", now).Error
		})
		if err != nil {
			log.Printf("failed to create question transaction: %v", err)
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
				log.Printf("error verifying folder ownership: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve questions"})
			}
			return
		}

		var questions []models.Question
		if err := db.Where("folder_id = ?", folderID).Find(&questions).Error; err != nil {
			log.Printf("failed to retrieve folder questions: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve questions"})
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

		question, err := validators.UserOwnQuestion(db, questionID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			} else {
				log.Printf("failed to retrieve question %d: %v", questionID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve question"})
			}
			return
		}

		c.JSON(http.StatusOK, dto.ToQuestionResponse(question))
	}
}

// Text/answer/difficulty/note only — does not support replacing the image.
func UpdateQuestion(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		questionID, err := strconv.Atoi(c.Param("questionID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid question id"})
			return
		}

		question, err := validators.UserOwnQuestion(db, questionID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			} else {
				log.Printf("failed to retrieve question for update %d: %v", questionID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update question"})
			}
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

		if err := db.Save(&question).Error; err != nil {
			log.Printf("failed to save question %d: %v", questionID, err)
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

		question, err := validators.UserOwnQuestion(db, questionID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "question not found"})
			} else {
				log.Printf("failed to find question for deletion %d: %v", questionID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete question"})
			}
			return
		}

		if err := db.Delete(&question).Error; err != nil {
			log.Printf("failed to delete question %d: %v", questionID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete question"})
			return
		}

		if question.ImageURL != "" {
			if err := DeleteQuestionImage(c.Request.Context(), question.ImageURL); err != nil {
				log.Printf("failed to delete image from cloudinary for question %d: %v", question.ID, err)
			}
		}

		c.Status(http.StatusNoContent)
	}
}
