package api

import (
	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ExamRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.Use(middleware.RequireAuth(db))

	router.POST("/", services.CreateExam(db))
	router.GET("/", services.ListExams(db))
	router.GET("/eligible-count", services.GetEligibleQuestionCount(db))
	router.GET("/:examID", services.GetExam(db))
	router.PATCH("/:examID", services.RenameExam(db))
	router.DELETE("/:examID", services.DeleteExam(db))

	router.POST("/:examID/attempts", services.StartAttempt(db))
	router.PUT("/:examID/attempts/:attemptID/complete", services.CompleteAttempt(db))
	router.GET("/:examID/attempts", services.ListAttempts(db))
	router.GET("/:examID/attempts/:attemptID", services.GetAttempt(db))
}
