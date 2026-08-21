package security

import (
	"errors"
	"time"

	"github.com/abde1khaliq/korasa/config"
	"github.com/golang-jwt/jwt/v4"
)

func GenerateTokens(userID int) (string, string, error) {
	if len(config.App.JWTSecret) == 0 {
		return "", "", errors.New("JWT_SECRET not set")
	}
	if len(config.App.JWTRefreshSecret) == 0 {
		return "", "", errors.New("JWT_REFRESH_SECRET not set")
	}

	accessClaims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessString, err := accessToken.SignedString([]byte(config.App.JWTSecret))
	if err != nil {
		return "", "", err
	}

	refreshClaims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshString, err := refreshToken.SignedString([]byte(config.App.JWTRefreshSecret))
	if err != nil {
		return "", "", err
	}

	return accessString, refreshString, nil
}

func ValidateToken(tokenStr string, isRefresh bool) (int, error) {
	secret := config.App.JWTSecret
	if isRefresh {
		secret = config.App.JWTRefreshSecret
	}

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(secret), nil
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
