package security_test

import (
	"testing"
	"time"

	"github.com/abde1khaliq/korasa/config"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/golang-jwt/jwt/v4"
)

func initSecurityConfig() {
	config.App.JWTSecret = "valid-secret-key-32-chars-long-strictly"
	config.App.JWTRefreshSecret = "valid-refresh-secret-32-chars-strictly"
}

func TestGenerateTokens_Success(t *testing.T) {
	initSecurityConfig()

	access, refresh, err := security.GenerateTokens(123)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if access == "" || refresh == "" {
		t.Fatalf("expected non-empty tokens, got access=%q, refresh=%q", access, refresh)
	}

	// Verify access token claims
	userID, err := security.ValidateToken(access, false)
	if err != nil {
		t.Fatalf("failed to validate access token: %v", err)
	}
	if userID != 123 {
		t.Fatalf("expected userID 123, got %d", userID)
	}

	// Verify refresh token claims
	refreshUserID, err := security.ValidateToken(refresh, true)
	if err != nil {
		t.Fatalf("failed to validate refresh token: %v", err)
	}
	if refreshUserID != 123 {
		t.Fatalf("expected userID 123 from refresh token, got %d", refreshUserID)
	}
}

func TestGenerateTokens_MissingSecrets(t *testing.T) {
	config.App.JWTSecret = ""
	config.App.JWTRefreshSecret = "valid-refresh-secret-32-chars-strictly"

	_, _, err := security.GenerateTokens(1)
	if err == nil || err.Error() != "JWT_SECRET not set" {
		t.Fatalf("expected JWT_SECRET not set error, got: %v", err)
	}

	config.App.JWTSecret = "valid-secret-key-32-chars-long-strictly"
	config.App.JWTRefreshSecret = ""

	_, _, err = security.GenerateTokens(1)
	if err == nil || err.Error() != "JWT_REFRESH_SECRET not set" {
		t.Fatalf("expected JWT_REFRESH_SECRET not set error, got: %v", err)
	}
}

func TestValidateToken_InvalidToken(t *testing.T) {
	initSecurityConfig()

	_, err := security.ValidateToken("invalid.token.string", false)
	if err == nil {
		t.Fatalf("expected error for invalid token string")
	}

	// Missing configured secret
	config.App.JWTSecret = ""
	_, err = security.ValidateToken("something", false)
	if err == nil || err.Error() != "JWT secret not configured" {
		t.Fatalf("expected 'JWT secret not configured', got: %v", err)
	}
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	initSecurityConfig()

	claims := jwt.MapClaims{
		"sub": 99,
		"exp": time.Now().Add(-10 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString([]byte(config.App.JWTSecret))

	_, err := security.ValidateToken(tokenStr, false)
	if err == nil {
		t.Fatalf("expected error for expired token, got nil")
	}
}

func TestValidateToken_WrongSecret(t *testing.T) {
	initSecurityConfig()

	claims := jwt.MapClaims{
		"sub": 99,
		"exp": time.Now().Add(10 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString([]byte("wrong-signing-secret-which-fails-32-chars"))

	_, err := security.ValidateToken(tokenStr, false)
	if err == nil {
		t.Fatalf("expected signature verification error, got nil")
	}
}
