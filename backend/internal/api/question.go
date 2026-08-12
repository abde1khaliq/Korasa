package api

import (
	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// mount on /api/folders — nested create/list
func QuestionRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.Use(middleware.RequireAuth())

	router.POST("/:folderID/questions", services.CreateQuestion(db))
	router.GET("/:folderID/questions", services.GetFolderQuestions(db))
}

// mount on /api/questions — flat single-question access
func QuestionDirectRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.Use(middleware.RequireAuth())

	router.GET("/:questionID", services.GetQuestionByID(db))
}
