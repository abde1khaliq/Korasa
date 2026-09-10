package services_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/test/testutil"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupSubjectRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	group := r.Group("/api/subjects")
	api.SubjectRoutes(group, db)
	return r
}

func TestSubjectService_Flow(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupSubjectRouter(db)

	u1, token1 := testutil.SeedUser(t, db, "subjuser1", "subj1@test.com", "user")
	_, token2 := testutil.SeedUser(t, db, "subjuser2", "subj2@test.com", "user")

	// 1. Initial GET - empty list
	w := testutil.PerformRequest(r, "GET", "/api/subjects", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var list []dto.SubjectResponse
	json.Unmarshal(w.Body.Bytes(), &list)
	if len(list) != 0 {
		t.Fatalf("expected 0 subjects, got %d", len(list))
	}

	// 2. POST /api/subjects - validation failure (empty name)
	w = testutil.PerformRequest(r, "POST", "/api/subjects", token1, map[string]string{"name": ""})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on empty name, got %d", w.Code)
	}

	// 3. POST /api/subjects - success
	w = testutil.PerformRequest(r, "POST", "/api/subjects", token1, map[string]string{"name": "Computer Science"})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 on create, got %d: %s", w.Code, w.Body.String())
	}
	var created dto.SubjectResponse
	json.Unmarshal(w.Body.Bytes(), &created)
	if created.Name != "Computer Science" || created.ID == 0 {
		t.Fatalf("unexpected created subject: %+v", created)
	}

	// 4. GET /api/subjects - should return 1 subject
	w = testutil.PerformRequest(r, "GET", "/api/subjects", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	json.Unmarshal(w.Body.Bytes(), &list)
	if len(list) != 1 || list[0].ID != created.ID {
		t.Fatalf("expected 1 subject with ID %d, got %+v", created.ID, list)
	}

	// 5. GET /api/subjects/recent
	w = testutil.PerformRequest(r, "GET", "/api/subjects/recent", token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on /recent, got %d: %s", w.Code, w.Body.String())
	}
	var recent dto.SubjectResponse
	json.Unmarshal(w.Body.Bytes(), &recent)
	if recent.ID != created.ID {
		t.Fatalf("expected recent ID %d, got %d", created.ID, recent.ID)
	}

	// 6. GET /api/subjects/:id - success for owner
	subjectURL := fmt.Sprintf("/api/subjects/%d", created.ID)
	w = testutil.PerformRequest(r, "GET", subjectURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on get by ID, got %d", w.Code)
	}

	// 7. GET /api/subjects/:id - 404 for other user
	w = testutil.PerformRequest(r, "GET", subjectURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2, got %d", w.Code)
	}

	// 8. PATCH /api/subjects/:id - rename subject
	w = testutil.PerformRequest(r, "PATCH", subjectURL, token1, map[string]string{"name": "Advanced CS"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on rename, got %d: %s", w.Code, w.Body.String())
	}
	var updated dto.SubjectResponse
	json.Unmarshal(w.Body.Bytes(), &updated)
	if updated.Name != "Advanced CS" {
		t.Fatalf("expected name 'Advanced CS', got %q", updated.Name)
	}

	// 9. DELETE /api/subjects/:id - other user cannot delete
	w = testutil.PerformRequest(r, "DELETE", subjectURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 delete, got %d", w.Code)
	}

	// 10. DELETE /api/subjects/:id - owner deletes
	w = testutil.PerformRequest(r, "DELETE", subjectURL, token1, nil)
	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on delete, got %d: %s", w.Code, w.Body.String())
	}

	// 11. GET /api/subjects/:id - now 404 for owner too
	w = testutil.PerformRequest(r, "GET", subjectURL, token1, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after deletion, got %d", w.Code)
	}

	_ = u1
}
