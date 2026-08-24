package api

import (
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func FolderRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.GET("/:subjectID/folders", services.GetSubjectFolders(db))
	router.POST("/:subjectID/folders", services.CreateFolder(db))
	router.PUT("/:subjectID/folders/:folderID", services.UpdateFolder(db))
	router.DELETE("/:subjectID/folders/:folderID", services.DeleteFolder(db))
}
