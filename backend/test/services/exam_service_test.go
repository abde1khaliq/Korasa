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

func setupExamRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	examGroup := r.Group("/api/exams")
	api.ExamRoutes(examGroup, db)
	return r
}

func TestExamService_Flow(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupExamRouter(db)

	u1, token1 := testutil.SeedUser(t, db, "exam_user1", "e1@test.com", "user")
	_, token2 := testutil.SeedUser(t, db, "exam_user2", "e2@test.com", "user")

	// Setup hierarchy for user 1: Subject -> Folder -> 3 Questions (2 easy, 1 hard)
	sub := models.Subject{UserID: u1.ID, Name: "Mathematics"}
	db.Create(&sub)

	folder := models.Folder{SubjectID: sub.ID, Name: "Calculus"}
	db.Create(&folder)

	q1 := models.Question{FolderID: folder.ID, ImageURL: "https://ex.com/1.png", Answer: "A1", Difficulty: "easy"}
	q2 := models.Question{FolderID: folder.ID, ImageURL: "https://ex.com/2.png", Answer: "A2", Difficulty: "easy"}
	q3 := models.Question{FolderID: folder.ID, ImageURL: "https://ex.com/3.png", Answer: "A3", Difficulty: "hard"}
	db.Create(&q1)
	db.Create(&q2)
	db.Create(&q3)

	// 1. GET /api/exams/eligible-count
	countURL := fmt.Sprintf("/api/exams/eligible-count?scope_type=subject&scope_id=%d&difficulties=easy", sub.ID)
	w := testutil.PerformRequest(r, "GET", countURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on eligible count, got %d: %s", w.Code, w.Body.String())
	}
	var countRes struct {
		Count int `json:"count"`
	}
	json.Unmarshal(w.Body.Bytes(), &countRes)
	if countRes.Count != 2 {
		t.Fatalf("expected 2 eligible easy questions, got %d", countRes.Count)
	}

	// 2. POST /api/exams - validation error: timed exam missing time limit
	invalidTimed := models.ExamInput{
		Name:          "Timed Math",
		Type:          "timed",
		ScopeType:     "subject",
		ScopeID:       sub.ID,
		Difficulties:  []string{"easy"},
		QuestionCount: 2,
	}
	w = testutil.PerformRequest(r, "POST", "/api/exams/", token1, invalidTimed)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for timed exam without time_limit_minutes, got %d", w.Code)
	}

	// 3. POST /api/exams - validation error: question count exceeds pool
	exceedPool := models.ExamInput{
		Name:          "Too Many Questions",
		Type:          "practice",
		ScopeType:     "subject",
		ScopeID:       sub.ID,
		Difficulties:  []string{"hard"}, // Only 1 hard question exists
		QuestionCount: 5,
	}
	w = testutil.PerformRequest(r, "POST", "/api/exams/", token1, exceedPool)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 when question_count exceeds pool, got %d", w.Code)
	}

	// 4. POST /api/exams - success: create practice exam with 2 easy questions
	validPractice := models.ExamInput{
		Name:          "Calculus Quiz 1",
		Type:          "practice",
		ScopeType:     "subject",
		ScopeID:       sub.ID,
		Difficulties:  []string{"easy"},
		QuestionCount: 2,
	}
	w = testutil.PerformRequest(r, "POST", "/api/exams/", token1, validPractice)
	if w.Code != http.StatusOK && w.Code != http.StatusCreated {
		t.Fatalf("expected 200/201 on create exam, got %d: %s", w.Code, w.Body.String())
	}
	var createdExam dto.ExamResponse
	json.Unmarshal(w.Body.Bytes(), &createdExam)
	if createdExam.ID == 0 || createdExam.Name != "Calculus Quiz 1" {
		t.Fatalf("unexpected exam created: %+v", createdExam)
	}

	// 5. GET /api/exams/ - lists user1's exams
	w = testutil.PerformRequest(r, "GET", "/api/exams/", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on list exams, got %d", w.Code)
	}
	var examList []dto.ExamResponse
	json.Unmarshal(w.Body.Bytes(), &examList)
	if len(examList) != 1 || examList[0].ID != createdExam.ID {
		t.Fatalf("expected 1 exam, got %+v", examList)
	}

	// 6. GET /api/exams/:id - user2 gets 404
	examDetailURL := fmt.Sprintf("/api/exams/%d", createdExam.ID)
	w = testutil.PerformRequest(r, "GET", examDetailURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 viewing user1's exam, got %d", w.Code)
	}

	// 7. PATCH /api/exams/:id - rename exam
	w = testutil.PerformRequest(r, "PATCH", examDetailURL, token1, models.RenameExamInput{Name: "Calculus Quiz Final"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on rename exam, got %d: %s", w.Code, w.Body.String())
	}

	// --- ATTEMPTS FLOW ---

	// 8. POST /api/exams/:id/attempts - user1 starts an attempt
	startAttemptURL := fmt.Sprintf("/api/exams/%d/attempts", createdExam.ID)
	w = testutil.PerformRequest(r, "POST", startAttemptURL, token1, nil)
	if w.Code != http.StatusOK && w.Code != http.StatusCreated {
		t.Fatalf("expected 200/201 on start attempt, got %d: %s", w.Code, w.Body.String())
	}
	var startedAttempt dto.StartAttemptResponse
	json.Unmarshal(w.Body.Bytes(), &startedAttempt)
	if startedAttempt.AttemptID == 0 || len(startedAttempt.Questions) != 2 {
		t.Fatalf("unexpected attempt started: %+v", startedAttempt)
	}

	// 9. PUT /api/exams/:id/attempts/:attemptID/complete - incomplete answers count -> 400
	completeAttemptURL := fmt.Sprintf("/api/exams/%d/attempts/%d/complete", createdExam.ID, startedAttempt.AttemptID)
	badSubmission := models.SubmitAttemptInput{
		Answers: []models.AttemptAnswerInput{
			{QuestionID: startedAttempt.Questions[0].QuestionID, IsCorrect: true},
			// only 1 answer provided when 2 are required
		},
	}
	w = testutil.PerformRequest(r, "PUT", completeAttemptURL, token1, badSubmission)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 when answers don't cover all questions, got %d", w.Code)
	}

	// 10. PUT /api/exams/:id/attempts/:attemptID/complete - submit full answers -> 200
	validSubmission := models.SubmitAttemptInput{
		Answers: []models.AttemptAnswerInput{
			{QuestionID: startedAttempt.Questions[0].QuestionID, IsCorrect: true},
			{QuestionID: startedAttempt.Questions[1].QuestionID, IsCorrect: false},
		},
	}
	w = testutil.PerformRequest(r, "PUT", completeAttemptURL, token1, validSubmission)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on complete attempt, got %d: %s", w.Code, w.Body.String())
	}
	var completedAttempt dto.AttemptResponse
	json.Unmarshal(w.Body.Bytes(), &completedAttempt)
	if completedAttempt.CorrectCount != 1 || completedAttempt.TotalCount != 2 || completedAttempt.CompletedAt == nil {
		t.Fatalf("unexpected completed attempt: %+v", completedAttempt)
	}

	// 11. PUT /api/exams/:id/attempts/:attemptID/complete - second submission -> 409 Conflict
	w = testutil.PerformRequest(r, "PUT", completeAttemptURL, token1, validSubmission)
	if w.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict when re-completing attempt, got %d", w.Code)
	}

	// 12. GET /api/exams/:id/attempts - list attempts
	w = testutil.PerformRequest(r, "GET", startAttemptURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on list attempts, got %d", w.Code)
	}

	// 13. GET /api/exams/:id/attempts/:attemptID - get single attempt
	getAttemptURL := fmt.Sprintf("/api/exams/%d/attempts/%d", createdExam.ID, startedAttempt.AttemptID)
	w = testutil.PerformRequest(r, "GET", getAttemptURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on get attempt by ID, got %d", w.Code)
	}

	// 14. DELETE /api/exams/:id - delete exam
	w = testutil.PerformRequest(r, "DELETE", examDetailURL, token1, nil)
	if w.Code != http.StatusOK && w.Code != http.StatusNoContent {
		t.Fatalf("expected 200/204 on delete exam, got %d", w.Code)
	}

	// 15. GET /api/exams/:id - 404 after deletion
	w = testutil.PerformRequest(r, "GET", examDetailURL, token1, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete exam, got %d", w.Code)
	}
}
