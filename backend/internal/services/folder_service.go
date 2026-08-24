package services

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateFolder(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		subjectID, err := strconv.Atoi(c.Param("subjectID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}

		if _, err := validators.UserOwnSubject(db, subjectID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var input models.FolderInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		folder := models.Folder{Name: input.Name, SubjectID: subjectID}

		if err := validators.Validate(folder); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&folder).Error; err != nil {
				return err
			}
			return tx.Model(&models.Subject{}).
				Where("id = ?", subjectID).
				Update("updated_at", time.Now()).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create folder"})
			return
		}

		c.JSON(http.StatusCreated, dto.ToFolderResponse(folder, db))
	}
}

func GetSubjectFolders(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		subjectID, err := strconv.Atoi(c.Param("subjectID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}

		if _, err := validators.UserOwnSubject(db, subjectID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var folders []models.Folder
		if err := db.Where("subject_id = ?", subjectID).Find(&folders).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, dto.ToFolderListResponse(folders, db))
	}
}

func UpdateFolder(db *gorm.DB) gin.HandlerFunc {
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var input models.FolderInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		folder.Name = input.Name
		if err := db.Save(&folder).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update folder"})
			return
		}

		c.JSON(http.StatusOK, dto.ToFolderResponse(folder, db))
	}
}

func DeleteFolder(db *gorm.DB) gin.HandlerFunc {
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
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Where("folder_id = ?", folder.ID).Delete(&models.Question{}).Error; err != nil {
				return err
			}
			return tx.Delete(&folder).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete folder"})
			return
		}

		c.Status(http.StatusNoContent)
	}
}
