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

func setupQuestionRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	folderGroup := r.Group("/api/folders")
	api.QuestionRoutes(folderGroup, db)

	questionGroup := r.Group("/api/questions")
	api.QuestionDirectRoutes(questionGroup, db)

	return r
}

func TestQuestionService_Flow(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupQuestionRouter(db)

	u1, token1 := testutil.SeedUser(t, db, "q_user1", "q1@test.com", "user")
	_, token2 := testutil.SeedUser(t, db, "q_user2", "q2@test.com", "user")

	// Create hierarchy: User1 -> Subject -> Folder -> Questions
	sub := models.Subject{UserID: u1.ID, Name: "Chemistry"}
	db.Create(&sub)

	folder := models.Folder{SubjectID: sub.ID, Name: "Organic"}
	db.Create(&folder)

	q1 := models.Question{
		FolderID:   folder.ID,
		ImageURL:   "https://example.com/chem1.png",
		Text:       "What is the IUPAC name of acetone?",
		Answer:     "Propan-2-one",
		Difficulty: "easy",
		Note:       "Carbonyl group at position 2",
	}
	db.Create(&q1)

	// 1. GET /api/folders/:folderID/questions - owner gets list
	folderQuestionsURL := fmt.Sprintf("/api/folders/%d/questions", folder.ID)
	w := testutil.PerformRequest(r, "GET", folderQuestionsURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on get folder questions, got %d", w.Code)
	}
	var qList []dto.QuestionResponse
	json.Unmarshal(w.Body.Bytes(), &qList)
	if len(qList) != 1 || qList[0].ID != q1.ID {
		t.Fatalf("expected 1 question with ID %d, got %+v", q1.ID, qList)
	}

	// 2. GET /api/folders/:folderID/questions - user2 gets 404
	w = testutil.PerformRequest(r, "GET", folderQuestionsURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2, got %d", w.Code)
	}

	// 3. GET /api/questions/:questionID - owner gets question
	questionURL := fmt.Sprintf("/api/questions/%d", q1.ID)
	w = testutil.PerformRequest(r, "GET", questionURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on get question by ID, got %d", w.Code)
	}
	var qResp dto.QuestionResponse
	json.Unmarshal(w.Body.Bytes(), &qResp)
	if qResp.Answer != "Propan-2-one" || qResp.Difficulty != "easy" {
		t.Fatalf("unexpected question data: %+v", qResp)
	}

	// 4. GET /api/questions/:questionID - user2 gets 404
	w = testutil.PerformRequest(r, "GET", questionURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2, got %d", w.Code)
	}

	// 5. PUT /api/questions/:questionID - invalid difficulty -> 400
	invalidPayload := map[string]string{
		"text":       "Updated text",
		"answer":     "Updated answer",
		"difficulty": "extreme", // invalid
	}
	w = testutil.PerformRequest(r, "PUT", questionURL, token1, invalidPayload)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid difficulty, got %d", w.Code)
	}

	// 6. PUT /api/questions/:questionID - user2 cannot update -> 404
	validPayload := map[string]string{
		"text":       "What is the IUPAC name for acetone?",
		"answer":     "Propan-2-one (propanone)",
		"difficulty": "medium",
		"note":       "Updated revision note",
	}
	w = testutil.PerformRequest(r, "PUT", questionURL, token2, validPayload)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 updating, got %d", w.Code)
	}

	// 7. PUT /api/questions/:questionID - owner updates -> 200
	w = testutil.PerformRequest(r, "PUT", questionURL, token1, validPayload)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on update question, got %d: %s", w.Code, w.Body.String())
	}
	json.Unmarshal(w.Body.Bytes(), &qResp)
	if qResp.Difficulty != "medium" || qResp.Answer != "Propan-2-one (propanone)" {
		t.Fatalf("unexpected updated question response: %+v", qResp)
	}

	// 8. DELETE /api/questions/:questionID - user2 cannot delete -> 404
	w = testutil.PerformRequest(r, "DELETE", questionURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 on user2 delete, got %d", w.Code)
	}

	// 9. DELETE /api/questions/:questionID - owner deletes -> 204
	w = testutil.PerformRequest(r, "DELETE", questionURL, token1, nil)
	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on delete question, got %d: %s", w.Code, w.Body.String())
	}

	// 10. GET /api/questions/:questionID - 404 after deletion
	w = testutil.PerformRequest(r, "GET", questionURL, token1, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete, got %d", w.Code)
	}
}
