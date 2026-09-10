package router

import (
	"net/http"

	"github.com/abde1khaliq/korasa/config"
	"github.com/abde1khaliq/korasa/internal/admin"
	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	// Limit multipart memory allocation to 8MB
	r.MaxMultipartMemory = 8 << 20

	// Security Headers
	r.Use(middleware.SecurityHeaders())

	// CORS Configuration
	corsConfig := cors.Config{
		AllowOrigins:     config.App.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length", "Retry-After"},
		AllowCredentials: true,
	}
	r.Use(cors.New(corsConfig))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	})

	SubjectRouteGroup := r.Group("/api/subjects")
	api.SubjectRoutes(SubjectRouteGroup, db)
	api.FolderRoutes(SubjectRouteGroup, db)

	FolderRouteGroup := r.Group("/api/folders")
	api.QuestionRoutes(FolderRouteGroup, db)

	QuestionRouteGroup := r.Group("/api/questions")
	api.QuestionDirectRoutes(QuestionRouteGroup, db)

	ExamRouteGroup := r.Group("/api/exams")
	api.ExamRoutes(ExamRouteGroup, db)

	LessonRouteGroup := r.Group("/api/lessons")
	api.LessonRoutes(LessonRouteGroup, db)

	UserRouteGroup := r.Group("/auth")
	api.UserRouters(UserRouteGroup, db)

	// Admin API endpoints (enforce JWT & admin role)
	AdminRouteGroup := r.Group("/api/admin")
	AdminRouteGroup.Use(middleware.RequireAuth(db), middleware.RequireAdmin(db))
	api.AdminRoutes(AdminRouteGroup, db)

	// Admin Web Console
	r.GET("/admin", admin.DashboardHandler)
	r.GET("/admin/*filepath", admin.DashboardHandler)

	return r
}
