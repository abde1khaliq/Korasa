package api

import (
	"time"

	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserRouters(router *gin.RouterGroup, db *gorm.DB) {
	authRateLimit := middleware.RateLimit(20, time.Minute)

	router.POST("/register", authRateLimit, services.RegisterUser(db))
	router.POST("/login", authRateLimit, services.LoginUser(db))
	router.POST("/refresh", services.RefreshUser(db))
	router.POST("/verify", authRateLimit, services.VerifyEmail(db))
	router.POST("/resend-verification", authRateLimit, services.ResendVerificationCode())
	router.POST("/forgot-password", authRateLimit, services.ForgotPassword(db))
	router.POST("/verify-reset-code", authRateLimit, services.VerifyResetCode())
	router.POST("/reset-password", authRateLimit, services.ResetPassword(db))
	router.POST("/resend-reset-code", authRateLimit, services.ResendPasswordResetCode(db))
	router.PATCH("/onboarding-complete", middleware.RequireAuth(db), services.CompleteOnboarding(db))
}
