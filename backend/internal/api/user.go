package api

import (
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRouters(router *gin.RouterGroup, db *gorm.DB) {
	router.POST("/register", services.RegisterUser(db))
	router.POST("/login", services.LoginUser(db))
	router.POST("/refresh", services.RefreshUser(db))
}
