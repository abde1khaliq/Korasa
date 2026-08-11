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

		c.JSON(http.StatusOK, dto.ToFolderListResponse(folders))
	}
}
