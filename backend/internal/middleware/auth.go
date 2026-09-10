package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RequireAuth(optionalDB ...*gorm.DB) gin.HandlerFunc {
	var db *gorm.DB
	if len(optionalDB) > 0 {
		db = optionalDB[0]
	}

	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or malformed token"})
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		userID, err := security.ValidateToken(tokenStr, false)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Set("userID", userID)

		if db != nil {
			go func(uid int) {
				fiveMinutesAgo := time.Now().Add(-5 * time.Minute)
				db.Model(&models.User{}).
					Where("id = ? AND (last_active_at IS NULL OR last_active_at < ?)", uid, fiveMinutesAgo).
					Update("last_active_at", time.Now())
			}(userID)
		}

		c.Next()
	}
}

func RequireAdmin(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		if userID == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var user models.User
		if err := db.Select("id, role").First(&user, userID).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}

		if user.Role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "admin access required"})
			return
		}

		c.Set("userRole", user.Role)
		c.Next()
	}
}

