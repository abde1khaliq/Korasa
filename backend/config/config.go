package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	JWTSecret           string
	JWTRefreshSecret    string
	PostgresDBUrl       string
	ResendAPIKey        string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	CORSAllowedOrigins  []string
}

var App Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	App = Config{
		Port:                getEnv("PORT", "8080"),
		JWTSecret:           getEnv("JWT_SECRET", ""),
		JWTRefreshSecret:    getEnv("JWT_REFRESH_SECRET", ""),
		PostgresDBUrl:       getEnv("POSTGRES_DATABASE_URL", ""),
		ResendAPIKey:        getEnv("RESEND_API_KEY", ""),
		CloudinaryCloudName: getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret: getEnv("CLOUDINARY_API_SECRET", ""),
		CORSAllowedOrigins:  getEnvSlice("CORS_ALLOWED_ORIGINS", []string{"https://www.korasa.study", "https://korasa.study", "http://localhost:3000"}),
	}
}

// Validate checks that all required security configurations are present and satisfy minimum security requirements.
func (c *Config) Validate() error {
	if c.PostgresDBUrl == "" {
		return fmt.Errorf("POSTGRES_DATABASE_URL must be configured")
	}
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET must be configured")
	}
	if len(c.JWTSecret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters long for cryptographic security")
	}
	if c.JWTRefreshSecret == "" {
		return fmt.Errorf("JWT_REFRESH_SECRET must be configured")
	}
	if len(c.JWTRefreshSecret) < 32 {
		return fmt.Errorf("JWT_REFRESH_SECRET must be at least 32 characters long for cryptographic security")
	}
	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func getEnvSlice(key string, fallback []string) []string {
	if value, exists := os.LookupEnv(key); exists {
		parts := strings.Split(value, ",")
		var res []string
		for _, p := range parts {
			trimmed := strings.TrimSpace(p)
			if trimmed != "" {
				res = append(res, trimmed)
			}
		}
		if len(res) > 0 {
			return res
		}
	}
	return fallback
}
