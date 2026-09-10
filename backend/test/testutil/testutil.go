package testutil

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/abde1khaliq/korasa/config"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// InitTestConfig sets up required configuration for tests
func InitTestConfig() {
	config.App.JWTSecret = "test-jwt-secret-key-32-chars-long-strictly"
	config.App.JWTRefreshSecret = "test-jwt-refresh-secret-key-32-chars-strictly"
	config.App.Port = "8080"
}

// SetupTestDB creates an in-memory SQLite database with all tables created.
func SetupTestDB(t *testing.T) *gorm.DB {
	InitTestConfig()
	gin.SetMode(gin.TestMode)

	dbName := fmt.Sprintf("file:mem_%s_%d?mode=memory&cache=shared", t.Name(), time.Now().UnixNano())
	db, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("failed to open in-memory sqlite db: %v", err)
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(1)
	}

	// Create all tables matching the models
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		role TEXT NOT NULL DEFAULT 'user',
		has_completed_onboarding BOOLEAN NOT NULL DEFAULT 0,
		last_active_at DATETIME,
		created_at DATETIME,
		updated_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS subjects (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		created_at DATETIME,
		updated_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS folders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		subject_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		created_at DATETIME,
		updated_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		folder_id INTEGER NOT NULL,
		image_url TEXT NOT NULL,
		text TEXT,
		answer TEXT NOT NULL,
		difficulty TEXT NOT NULL,
		note TEXT,
		created_at DATETIME,
		updated_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS exams (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		type TEXT NOT NULL,
		scope_type TEXT NOT NULL,
		scope_id INTEGER NOT NULL,
		difficulties TEXT NOT NULL,
		question_count INTEGER NOT NULL,
		time_limit_minutes INTEGER,
		created_at DATETIME,
		updated_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS exam_questions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		exam_id INTEGER NOT NULL,
		question_id INTEGER NOT NULL,
		position INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS exam_attempts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		exam_id INTEGER NOT NULL,
		user_id INTEGER NOT NULL,
		started_at DATETIME NOT NULL,
		completed_at DATETIME,
		correct_count INTEGER NOT NULL DEFAULT 0,
		total_count INTEGER NOT NULL,
		duration_secs INTEGER,
		created_at DATETIME,
		updated_at DATETIME
	);

	CREATE TABLE IF NOT EXISTS exam_attempt_answers (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		attempt_id INTEGER NOT NULL,
		question_id INTEGER NOT NULL,
		is_correct BOOLEAN NOT NULL,
		position INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS lessons (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		subject_id INTEGER,
		title TEXT NOT NULL,
		description TEXT,
		day_of_week INTEGER NOT NULL,
		start_time TEXT NOT NULL,
		end_time TEXT,
		location TEXT,
		color TEXT,
		reminder_minutes INTEGER NOT NULL DEFAULT 15,
		created_at DATETIME,
		updated_at DATETIME
	);
	`

	if err := db.Exec(schema).Error; err != nil {
		t.Fatalf("failed to initialize test database schema: %v", err)
	}

	return db
}

// SeedUser creates a user in the database and generates an access token.
func SeedUser(t *testing.T, db *gorm.DB, username, email, role string) (models.User, string) {
	hashedPassword, _ := security.HashPassword("password123")
	now := time.Now()
	user := models.User{
		Username:     username,
		Email:        email,
		Password:     hashedPassword,
		Role:         role,
		LastActiveAt: now,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to seed user: %v", err)
	}

	token, _, err := security.GenerateTokens(user.ID)
	if err != nil {
		t.Fatalf("failed to generate token for seeded user: %v", err)
	}

	return user, token
}

// PerformRequest dispatches an HTTP request to the Gin router and returns the recorder.
func PerformRequest(r *gin.Engine, method, path, token string, body interface{}) *httptest.ResponseRecorder {
	var bodyReader io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		bodyReader = bytes.NewBuffer(b)
	}

	req, _ := http.NewRequest(method, path, bodyReader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	}

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}
