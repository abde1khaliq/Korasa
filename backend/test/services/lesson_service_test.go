package services_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/test/testutil"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupLessonRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	group := r.Group("/api/lessons")
	api.LessonRoutes(group, db)
	return r
}

func TestLessonService_Flow(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupLessonRouter(db)

	u1, token1 := testutil.SeedUser(t, db, "lessonuser1", "l1@test.com", "user")
	_, token2 := testutil.SeedUser(t, db, "lessonuser2", "l2@test.com", "user")

	// Create a subject for user 1
	sub := models.Subject{UserID: u1.ID, Name: "Computer Systems"}
	db.Create(&sub)

	// 1. POST /api/lessons - validation error: invalid time format
	badTime := models.LessonInput{
		Title:     "CS Lecture",
		StartTime: "9am", // invalid HH:mm
	}
	w := testutil.PerformRequest(r, "POST", "/api/lessons", token1, badTime)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for bad start_time format, got %d: %s", w.Code, w.Body.String())
	}

	// 2. POST /api/lessons - validation error: end_time before start_time
	badRange := "09:00"
	badRangeInput := models.LessonInput{
		Title:     "CS Lecture",
		StartTime: "10:00",
		EndTime:   &badRange, // 09:00 before 10:00
	}
	day := 1
	badRangeInput.DayOfWeek = &day
	w = testutil.PerformRequest(r, "POST", "/api/lessons", token1, badRangeInput)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 when end_time <= start_time, got %d", w.Code)
	}

	// 3. POST /api/lessons - validation error: user2 trying to attach user1's subject
	subjectID := sub.ID
	otherUserSub := models.LessonInput{
		SubjectID: &subjectID,
		Title:     "Hacked Lecture",
		StartTime: "10:00",
		DayOfWeek: &day,
	}
	w = testutil.PerformRequest(r, "POST", "/api/lessons", token2, otherUserSub)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 when user2 references user1's subject, got %d", w.Code)
	}

	// 4. POST /api/lessons - success: create recurring lesson across multiple days
	endTime := "11:30"
	validMultiDays := models.LessonInput{
		SubjectID:  &subjectID,
		Title:      "Operating Systems",
		DaysOfWeek: []int{1, 3}, // Monday and Wednesday
		StartTime:  "10:00",
		EndTime:    &endTime,
		Location:   "Hall A",
		Color:      "#3B82F6",
	}
	w = testutil.PerformRequest(r, "POST", "/api/lessons", token1, validMultiDays)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 on create multiple lessons, got %d: %s", w.Code, w.Body.String())
	}
	var createdList []dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &createdList)
	if len(createdList) != 2 {
		t.Fatalf("expected 2 lessons created for 2 days, got %d", len(createdList))
	}

	firstLessonID := createdList[0].ID

	// 5. GET /api/lessons - lists lessons
	w = testutil.PerformRequest(r, "GET", "/api/lessons", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on list lessons, got %d", w.Code)
	}
	var allLessons []dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &allLessons)
	if len(allLessons) != 2 {
		t.Fatalf("expected 2 lessons in list, got %d", len(allLessons))
	}

	// 6. GET /api/lessons?day_of_week=1 - filter by Monday
	w = testutil.PerformRequest(r, "GET", "/api/lessons?day_of_week=1", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on filtered list, got %d", w.Code)
	}
	var mondayLessons []dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &mondayLessons)
	if len(mondayLessons) != 1 || mondayLessons[0].DayOfWeek != 1 {
		t.Fatalf("expected 1 Monday lesson, got %+v", mondayLessons)
	}

	// 7. GET /api/lessons/upcoming - returns upcoming lessons
	w = testutil.PerformRequest(r, "GET", "/api/lessons/upcoming?limit=5", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on upcoming lessons, got %d", w.Code)
	}
	var upcoming []dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &upcoming)
	if len(upcoming) != 2 {
		t.Fatalf("expected 2 upcoming lessons, got %d", len(upcoming))
	}

	// 8. GET /api/lessons/:id - user1 gets lesson
	lessonURL := fmt.Sprintf("/api/lessons/%d", firstLessonID)
	w = testutil.PerformRequest(r, "GET", lessonURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on get lesson by ID, got %d", w.Code)
	}
	var lessonDetail dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &lessonDetail)
	if lessonDetail.Title != "Operating Systems" {
		t.Fatalf("expected title 'Operating Systems', got %q", lessonDetail.Title)
	}

	// 9. GET /api/lessons/:id - user2 gets 404
	w = testutil.PerformRequest(r, "GET", lessonURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2, got %d", w.Code)
	}

	// 10. PATCH /api/lessons/:id - update lesson
	newEnd := "12:00"
	updateInput := models.LessonInput{
		Title:     "Advanced OS",
		StartTime: "10:30",
		EndTime:   &newEnd,
		Location:  "Lab 2",
	}
	w = testutil.PerformRequest(r, "PATCH", lessonURL, token1, updateInput)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on update lesson, got %d: %s", w.Code, w.Body.String())
	}
	var updated dto.LessonResponse
	json.Unmarshal(w.Body.Bytes(), &updated)
	if updated.Title != "Advanced OS" || updated.Location != "Lab 2" {
		t.Fatalf("unexpected updated lesson: %+v", updated)
	}

	// 11. DELETE /api/lessons/:id - user2 cannot delete -> 404
	w = testutil.PerformRequest(r, "DELETE", lessonURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 delete, got %d", w.Code)
	}

	// 12. DELETE /api/lessons/:id - owner deletes -> 200
	w = testutil.PerformRequest(r, "DELETE", lessonURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on delete lesson, got %d: %s", w.Code, w.Body.String())
	}

	// 13. GET /api/lessons/:id - 404 after deletion
	w = testutil.PerformRequest(r, "GET", lessonURL, token1, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete lesson, got %d", w.Code)
	}
}
