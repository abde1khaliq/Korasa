package router

import (
	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(db *gorm.DB) *gin.Engine {
	r := gin.Default()

	SubjectRouteGroup := r.Group("/api/subjects")
	api.SubjectRoutes(SubjectRouteGroup, db)

	UserRouteGroup := r.Group("/auth")
	api.UserRouters(UserRouteGroup, db)

	return r
}
