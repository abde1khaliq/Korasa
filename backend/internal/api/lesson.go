package api

import (
	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// LessonRoutes registers routes for calendar lessons.
func LessonRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.Use(middleware.RequireAuth())

	router.POST("", services.CreateLesson(db))
	router.POST("/", services.CreateLesson(db))
	router.GET("", services.ListLessons(db))
	router.GET("/", services.ListLessons(db))
	router.GET("/upcoming", services.GetUpcomingLessons(db))
	router.GET("/:lessonID", services.GetLesson(db))
	router.PATCH("/:lessonID", services.UpdateLesson(db))
	router.PUT("/:lessonID", services.UpdateLesson(db))
	router.DELETE("/:lessonID", services.DeleteLesson(db))
}
