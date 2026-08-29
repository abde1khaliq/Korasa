package services

import (
	"crypto/subtle"
	"net/http"
	"sync"
	"time"

	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	verificationCodeTTL  = 10 * time.Minute
	verificationMaxTries = 5
	verificationResendCD = 60 * time.Second
)

type VerificationData struct {
	Code           string
	Username       string
	Email          string
	HashedPassword string
	Attempts       int
	ExpiresAt      time.Time
	LastSentAt     time.Time
}

type verificationStore struct {
	mu   sync.Mutex
	data map[string]VerificationData
}

func newVerificationStore() *verificationStore {
	return &verificationStore{data: make(map[string]VerificationData)}
}

func (s *verificationStore) get(email string) (VerificationData, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	v, ok := s.data[email]
	if !ok {
		return VerificationData{}, false
	}
	if time.Now().After(v.ExpiresAt) {
		delete(s.data, email)
		return VerificationData{}, false
	}
	return v, true
}

func (s *verificationStore) set(email string, v VerificationData) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[email] = v
}

func (s *verificationStore) delete(email string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.data, email)
}

func (s *verificationStore) incrementAttempts(email string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if v, ok := s.data[email]; ok {
		v.Attempts++
		s.data[email] = v
	}
}

var verificationCodes = newVerificationStore()
var passwordResetCodes = newVerificationStore()

func RegisterUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input models.RegisterInput

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var existingUser models.User
		if err := db.Where("email = ? OR username = ?", input.Email, input.Username).First(&existingUser).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "user with this email or username already exists"})
			return
		}

		hashed, err := security.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not process password"})
			return
		}

		code, err := security.GenerateVerificationCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate verification code"})
			return
		}

		verificationCodes.set(input.Email, VerificationData{
			Code:           code,
			Username:       input.Username,
			Email:          input.Email,
			HashedPassword: hashed,
			ExpiresAt:      time.Now().Add(verificationCodeTTL),
			LastSentAt:     time.Now(),
		})

		if err := SendVerificationCode(input.Email, code); err != nil {
			verificationCodes.delete(input.Email)
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

		verificationData, exists := verificationCodes.get(input.Email)
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired verification code"})
			return
		}

		if verificationData.Attempts >= verificationMaxTries {
			verificationCodes.delete(input.Email)
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many failed attempts, please register again"})
			return
		}

		if subtle.ConstantTimeCompare([]byte(verificationData.Code), []byte(input.Code)) != 1 {
			verificationCodes.incrementAttempts(input.Email)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired verification code"})
			return
		}

		user := models.User{
			Username: verificationData.Username,
			Email:    verificationData.Email,
			Password: verificationData.HashedPassword,
		}

		if err := db.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
			return
		}

		verificationCodes.delete(input.Email)

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
				"id":                       user.ID,
				"email":                    user.Email,
				"username":                 user.Username,
				"has_completed_onboarding": user.HasCompletedOnboarding,
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

		generic := gin.H{"message": "If that email has a pending verification, a new code has been sent."}

		verificationData, exists := verificationCodes.get(input.Email)
		if !exists {
			c.JSON(http.StatusOK, generic)
			return
		}

		if time.Since(verificationData.LastSentAt) < verificationResendCD {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "please wait before requesting another code"})
			return
		}

		newCode, err := security.GenerateVerificationCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate verification code"})
			return
		}

		verificationData.Code = newCode
		verificationData.Attempts = 0
		verificationData.ExpiresAt = time.Now().Add(verificationCodeTTL)
		verificationData.LastSentAt = time.Now()
		verificationCodes.set(input.Email, verificationData)

		if err := SendVerificationCode(input.Email, newCode); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send verification email"})
			return
		}

		c.JSON(http.StatusOK, generic)
	}
}

func CompleteOnboarding(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		if err := db.Model(&models.User{}).
			Where("id = ?", userID).
			Update("has_completed_onboarding", true).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update onboarding status"})
			return
		}

		c.Status(http.StatusNoContent)
	}
}

func ForgotPassword(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email is required"})
			return
		}

		generic := gin.H{"message": "If an account with that email exists, a reset code has been sent."}

		var user models.User
		if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
			c.JSON(http.StatusOK, generic)
			return
		}

		code, err := security.GenerateVerificationCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate reset code"})
			return
		}

		passwordResetCodes.set(input.Email, VerificationData{
			Code:       code,
			Email:      input.Email,
			ExpiresAt:  time.Now().Add(verificationCodeTTL),
			LastSentAt: time.Now(),
		})

		if err := SendPasswordResetCode(input.Email, code); err != nil {
			passwordResetCodes.delete(input.Email)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send reset email"})
			return
		}

		c.JSON(http.StatusOK, generic)
	}
}

func VerifyResetCode() gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
			Code  string `json:"code" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email and code are required"})
			return
		}

		resetData, exists := passwordResetCodes.get(input.Email)
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired reset code"})
			return
		}

		if resetData.Attempts >= verificationMaxTries {
			passwordResetCodes.delete(input.Email)
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many failed attempts, please request a new code"})
			return
		}

		if subtle.ConstantTimeCompare([]byte(resetData.Code), []byte(input.Code)) != 1 {
			passwordResetCodes.incrementAttempts(input.Email)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired reset code"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Code verified."})
	}
}

func ResetPassword(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email    string `json:"email" binding:"required"`
			Code     string `json:"code" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email, code, and password are required"})
			return
		}

		if len(input.Password) < 8 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
			return
		}

		resetData, exists := passwordResetCodes.get(input.Email)
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired reset code"})
			return
		}

		if resetData.Attempts >= verificationMaxTries {
			passwordResetCodes.delete(input.Email)
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many failed attempts, please request a new code"})
			return
		}

		if subtle.ConstantTimeCompare([]byte(resetData.Code), []byte(input.Code)) != 1 {
			passwordResetCodes.incrementAttempts(input.Email)
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid or expired reset code"})
			return
		}

		hashed, err := security.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not process password"})
			return
		}

		if err := db.Model(&models.User{}).Where("email = ?", input.Email).Update("password", hashed).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update password"})
			return
		}

		passwordResetCodes.delete(input.Email)

		c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully."})
	}
}

func ResendPasswordResetCode(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Email string `json:"email" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email is required"})
			return
		}

		generic := gin.H{"message": "If an account with that email exists, a new reset code has been sent."}

		var user models.User
		if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
			c.JSON(http.StatusOK, generic)
			return
		}

		resetData, exists := passwordResetCodes.get(input.Email)
		if !exists {
			c.JSON(http.StatusOK, generic)
			return
		}

		if time.Since(resetData.LastSentAt) < verificationResendCD {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "please wait before requesting another code"})
			return
		}

		newCode, err := security.GenerateVerificationCode()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate reset code"})
			return
		}

		resetData.Code = newCode
		resetData.Attempts = 0
		resetData.ExpiresAt = time.Now().Add(verificationCodeTTL)
		resetData.LastSentAt = time.Now()
		passwordResetCodes.set(input.Email, resetData)

		if err := SendPasswordResetCode(input.Email, newCode); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not send reset email"})
			return
		}

		c.JSON(http.StatusOK, generic)
	}
}

