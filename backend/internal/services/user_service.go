package services

import (
	"net/http"
	"time"

	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var verificationCodes = make(map[string]VerificationData)

type VerificationData struct {
	Code      string
	UserData  models.RegisterInput
	ExpiresAt time.Time
}

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

		var existingUser models.User
		if err := db.Where("email = ? OR username = ?", input.Email, input.Username).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "user with this email or username already exists"})
			return
		}

		code := security.GenerateVerificationCode()

		verificationCodes[input.Email] = VerificationData{
			Code:      code,
			UserData:  input,
			ExpiresAt: time.Now().Add(10 * time.Minute),
		}

		if err := SendVerificationCode(input.Email, code); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send verification email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Verification code sent to your email. Please verify to complete registration.",
			"email":   input.Email,
		})
	}
}

func VerifyEmail(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
			Code  string `json:"code" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email and code are required"})
			return
		}

		verificationData, exists := verificationCodes[input.Email]
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no verification code found for this email"})
			return
		}

		if time.Now().After(verificationData.ExpiresAt) {
			delete(verificationCodes, input.Email)
			c.JSON(http.StatusBadRequest, gin.H{"error": "verification code has expired"})
			return
		}

		if verificationData.Code != input.Code {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid verification code"})
			return
		}

		hashed, err := security.HashPassword(verificationData.UserData.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not process password"})
			return
		}

		user := models.User{
			Username: verificationData.UserData.Username,
			Email:    verificationData.UserData.Email,
			Password: hashed,
		}

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
			return
		}

		delete(verificationCodes, input.Email)

		c.JSON(http.StatusCreated, gin.H{
			"message": "User successfully verified and registered!",
			"user": gin.H{
				"id":       user.ID,
				"email":    user.Email,
				"username": user.Username,
			},
		})
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

func ResendVerificationCode() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email is required"})
			return
		}

		verificationData, exists := verificationCodes[input.Email]
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no pending verification found for this email"})
			return
		}

		newCode := security.GenerateVerificationCode()

		verificationData.Code = newCode
		verificationData.ExpiresAt = time.Now().Add(10 * time.Minute)
		verificationCodes[input.Email] = verificationData

		if err := SendVerificationCode(input.Email, newCode); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send verification email"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "New verification code sent to your email",
		})
	}
}
