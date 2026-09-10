package config_test

import (
	"testing"

	"github.com/abde1khaliq/korasa/config"
)

func validConfig() config.Config {
	return config.Config{
		Port:             "8080",
		PostgresDBUrl:    "postgres://user:pass@localhost:5432/korasa",
		JWTSecret:        "12345678901234567890123456789012",
		JWTRefreshSecret: "12345678901234567890123456789012",
	}
}

func TestConfig_Validate_Success(t *testing.T) {
	c := validConfig()
	if err := c.Validate(); err != nil {
		t.Fatalf("expected valid config, got: %v", err)
	}
}

func TestConfig_Validate_MissingDB(t *testing.T) {
	c := validConfig()
	c.PostgresDBUrl = ""
	if err := c.Validate(); err == nil || err.Error() != "POSTGRES_DATABASE_URL must be configured" {
		t.Fatalf("expected missing db error, got: %v", err)
	}
}

func TestConfig_Validate_MissingJWTSecret(t *testing.T) {
	c := validConfig()
	c.JWTSecret = ""
	if err := c.Validate(); err == nil || err.Error() != "JWT_SECRET must be configured" {
		t.Fatalf("expected missing JWT_SECRET error, got: %v", err)
	}
}

func TestConfig_Validate_ShortJWTSecret(t *testing.T) {
	c := validConfig()
	c.JWTSecret = "too-short-secret"
	if err := c.Validate(); err == nil {
		t.Fatalf("expected error for short JWT secret (<32 chars)")
	}
}

func TestConfig_Validate_MissingJWTRefreshSecret(t *testing.T) {
	c := validConfig()
	c.JWTRefreshSecret = ""
	if err := c.Validate(); err == nil || err.Error() != "JWT_REFRESH_SECRET must be configured" {
		t.Fatalf("expected missing JWT_REFRESH_SECRET error, got: %v", err)
	}
}

func TestConfig_Validate_ShortJWTRefreshSecret(t *testing.T) {
	c := validConfig()
	c.JWTRefreshSecret = "too-short-refresh"
	if err := c.Validate(); err == nil {
		t.Fatalf("expected error for short refresh secret (<32 chars)")
	}
}
