package security

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSecret = "1fb63e9ab660535b675c09d6f614edb2d63a49da2830a0dd6fe0803b316137e3"
var jwtRefreshSecret = "c6b4f8d1caf962dea217929f3abc5a978f53b29954cee7c6f48de7d10f2c2348"

func GenerateTokens(userID int) (string, string, error) {
	if len(jwtSecret) == 0 {
		return "", "", errors.New("JWT_SECRET not set")
	}

	// Access Token (15 minutes)
	accessClaims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return "", "", err
	}

	// Refresh Token (7 days)
	refreshClaims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshString, err := refreshToken.SignedString(jwtRefreshSecret)
	if err != nil {
		return "", "", err
	}

	return accessString, refreshString, nil
}

func ValidateToken(tokenStr string, isRefresh bool) (int, error) {
	secret := jwtSecret
	if isRefresh {
		secret = jwtRefreshSecret
	}

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return secret, nil
	})
	if err != nil || !token.Valid {
		return 0, errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}
	sub, ok := claims["sub"].(float64)
	if !ok {
		return 0, errors.New("invalid subject claim")
	}
	return int(sub), nil
}
