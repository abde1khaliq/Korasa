package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	JWTSecret        string
	JWTRefreshSecret string
	PostgresDBUrl    string
	ClientUrl        string
}

var App Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	App = Config{
		Port:             getEnv("PORT", "8080"),
		JWTSecret:        getEnv("JWT_SECRET", ""),
		JWTRefreshSecret: getEnv("JWTRefreshSecret", ""),
		ClientUrl:        getEnv("CLIENT_URL", ""),
		PostgresDBUrl:    getEnv("POSTGRES_DATABASE_URL", ""),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
