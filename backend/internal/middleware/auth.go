package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/gin-gonic/gin"
)

func RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("RequireAuth hit, header:", c.GetHeader("Authorization"))
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
		c.Next()
	}
}

