package services

import (
	"net/http"

	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.RegisterInput

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		if err := validators.Validate(input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		hashed, err := security.HashPassword(input.Password)
		if err != nil {
			c.JSON(500, gin.H{"error": "could not process password"})
			return
		}
		user := models.User{Username: input.Username, Email: input.Email, Password: hashed}

		if err := db.Create(&user).Error; err != nil {
			c.JSON(500, gin.H{"error": "could not create user"})
			return
		}

		c.JSON(201, gin.H{"message": "User was successfully created."})
	}
}

func LoginUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		if !security.CheckPassword(input.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}

		accessToken, refreshToken, err := security.GenerateTokens(int(user.ID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate tokens"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"accessToken":  accessToken,
			"refreshToken": refreshToken,
			"user": gin.H{
				"id":       user.ID,
				"email":    user.Email,
				"username": user.Username,
			},
		})
	}
}

func RefreshUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			RefreshToken string `json:"refreshToken"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing refresh token"})
			return
		}

		userID, err := security.ValidateToken(input.RefreshToken, true)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
			return
		}

		accessToken, newRefreshToken, err := security.GenerateTokens(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate tokens"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"accessToken":  accessToken,
			"refreshToken": newRefreshToken,
		})
	}
}
