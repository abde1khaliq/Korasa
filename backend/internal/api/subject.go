package api

import (
	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SubjectRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.Use(middleware.RequireAuth())

	router.GET("/", services.GetUserSubjects(db))
	router.POST("/", services.CreateSubject(db))
	router.GET("/:subjectID", services.GetSubjectByID(db))
	router.DELETE("/:subjectID", services.DeleteSubject(db))
	router.PATCH("/:subjectID", services.UpdateSubject(db))
	router.GET("/recent", services.GetMostRecentSubject(db))
}
