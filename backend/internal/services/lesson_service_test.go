package services_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	execSQL := `
	CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		has_completed_onboarding INTEGER NOT NULL DEFAULT 0,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE subjects (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		user_id INTEGER NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE lessons (
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
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	`
	if err := db.Exec(execSQL).Error; err != nil {
		t.Fatalf("failed to create tables: %v", err)
	}

	return db
}

func setupTestRouter(db *gorm.DB, userID int) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("userID", userID)
		c.Next()
	})

	apiGroup := r.Group("/api/lessons")
	apiGroup.POST("", services.CreateLesson(db))
	apiGroup.GET("", services.ListLessons(db))
	apiGroup.GET("/upcoming", services.GetUpcomingLessons(db))
	apiGroup.GET("/:lessonID", services.GetLesson(db))
	apiGroup.PATCH("/:lessonID", services.UpdateLesson(db))
	apiGroup.DELETE("/:lessonID", services.DeleteLesson(db))

	return r
}

func TestCreateAndGetPeriodicLesson(t *testing.T) {
	db := setupTestDB(t)
	r := setupTestRouter(db, 1)

	// Create user and subject
	user := models.User{ID: 1, Username: "student1", Email: "student1@example.com", Password: "hashedpassword"}
	db.Create(&user)
	subject := models.Subject{ID: 1, Name: "Mathematics", UserID: 1}
	db.Create(&subject)

	tueDay := 2 // Tuesday
	endTime := "11:30"
	reminder := 30
	subID := 1

	payload := models.LessonInput{
		SubjectID:       &subID,
		Title:           "Calculus Lecture",
		Description:     "Every Tuesday class",
		DayOfWeek:       &tueDay,
		StartTime:       "10:00",
		EndTime:         &endTime,
		Location:        "Room 101",
		Color:           "#A8703F",
		ReminderMinutes: &reminder,
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/lessons", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", w.Code, w.Body.String())
	}

	var created dto.LessonResponse
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if created.Title != "Calculus Lecture" {
		t.Errorf("expected title 'Calculus Lecture', got %s", created.Title)
	}
	if created.DayOfWeek != 2 || created.DayName != "Tuesday" {
		t.Errorf("expected Tuesday (2), got %d (%s)", created.DayOfWeek, created.DayName)
	}
	if created.StartTime != "10:00" {
		t.Errorf("expected start_time '10:00', got %s", created.StartTime)
	}

	// Get lesson
	reqGet := httptest.NewRequest(http.MethodGet, "/api/lessons/1", nil)
	wGet := httptest.NewRecorder()
	r.ServeHTTP(wGet, reqGet)

	if wGet.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", wGet.Code)
	}
}

func TestBatchCreatePeriodicLessons(t *testing.T) {
	db := setupTestDB(t)
	r := setupTestRouter(db, 1)

	// Create for Monday (1) and Wednesday (3)
	payload := models.LessonInput{
		Title:      "Physics 101",
		DaysOfWeek: []int{1, 3},
		StartTime:  "09:00",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/lessons", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", w.Code, w.Body.String())
	}

	var created []dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &created)
	if len(created) != 2 {
		t.Fatalf("expected 2 created lessons, got %d", len(created))
	}
	if created[0].DayOfWeek != 1 || created[1].DayOfWeek != 3 {
		t.Errorf("unexpected days: %d, %d", created[0].DayOfWeek, created[1].DayOfWeek)
	}
}

func TestListAndFilterLessons(t *testing.T) {
	db := setupTestDB(t)
	r := setupTestRouter(db, 1)

	// Multiple lessons on the same day (Tuesday: 2)
	l1 := models.Lesson{
		UserID:    1,
		Title:     "Tuesday Morning Physics",
		DayOfWeek: 2,
		StartTime: "09:00",
	}
	l2 := models.Lesson{
		UserID:    1,
		Title:     "Tuesday Afternoon Math",
		DayOfWeek: 2,
		StartTime: "14:00",
	}
	l3 := models.Lesson{
		UserID:    1,
		Title:     "Thursday Lab",
		DayOfWeek: 4,
		StartTime: "10:00",
	}
	db.Create(&l1)
	db.Create(&l2)
	db.Create(&l3)

	// Filter by Tuesday (day_of_week=2)
	reqTue := httptest.NewRequest(http.MethodGet, "/api/lessons?day_of_week=2", nil)
	wTue := httptest.NewRecorder()
	r.ServeHTTP(wTue, reqTue)

	var tueLessons []dto.LessonResponse
	json.Unmarshal(wTue.Body.Bytes(), &tueLessons)
	if len(tueLessons) != 2 {
		t.Fatalf("expected 2 lessons on Tuesday, got %d", len(tueLessons))
	}
	if tueLessons[0].StartTime != "09:00" || tueLessons[1].StartTime != "14:00" {
		t.Errorf("lessons not sorted by start time: %+v", tueLessons)
	}

	// Upcoming lessons endpoint
	reqUp := httptest.NewRequest(http.MethodGet, "/api/lessons/upcoming", nil)
	wUp := httptest.NewRecorder()
	r.ServeHTTP(wUp, reqUp)

	var upLessons []dto.LessonResponse
	json.Unmarshal(wUp.Body.Bytes(), &upLessons)
	if len(upLessons) != 3 {
		t.Errorf("expected 3 upcoming lessons, got %d", len(upLessons))
	}
}
