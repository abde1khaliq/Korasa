package router

import (
	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://www.korasa.study", "https://korasa.study", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "PUT"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	SubjectRouteGroup := r.Group("/api/subjects")
	api.SubjectRoutes(SubjectRouteGroup, db)
	api.FolderRoutes(SubjectRouteGroup, db)

	FolderRouteGroup := r.Group("/api/folders")
	api.QuestionRoutes(FolderRouteGroup, db)

	QuestionRouteGroup := r.Group("/api/questions")
	api.QuestionDirectRoutes(QuestionRouteGroup, db)

	UserRouteGroup := r.Group("/auth")
	api.UserRouters(UserRouteGroup, db)

	return r
}
