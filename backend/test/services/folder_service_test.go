package services_test

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/test/testutil"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupFolderRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	group := r.Group("/api/subjects")
	group.Use(middleware.RequireAuth(db))
	api.FolderRoutes(group, db)
	return r
}

func TestFolderService_Flow(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupFolderRouter(db)

	u1, token1 := testutil.SeedUser(t, db, "folderuser1", "f1@test.com", "user")
	_, token2 := testutil.SeedUser(t, db, "folderuser2", "f2@test.com", "user")

	// Create subject for user 1
	sub1 := models.Subject{UserID: u1.ID, Name: "Algorithms"}
	db.Create(&sub1)

	baseURL := fmt.Sprintf("/api/subjects/%d/folders", sub1.ID)

	// 1. Initial GET - 0 folders
	w := testutil.PerformRequest(r, "GET", baseURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	var list []dto.FolderResponse
	json.Unmarshal(w.Body.Bytes(), &list)
	if len(list) != 0 {
		t.Fatalf("expected 0 folders initially, got %d", len(list))
	}

	// 2. POST - validation failure (empty name)
	w = testutil.PerformRequest(r, "POST", baseURL, token1, map[string]string{"name": ""})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on empty folder name, got %d", w.Code)
	}

	// 3. POST - other user attempting to create folder in user1's subject -> 404
	w = testutil.PerformRequest(r, "POST", baseURL, token2, map[string]string{"name": "Graph Theory"})
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 creating folder in user1's subject, got %d", w.Code)
	}

	// 4. POST - user1 creates folder -> 201
	w = testutil.PerformRequest(r, "POST", baseURL, token1, map[string]string{"name": "Dynamic Programming"})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 on create folder, got %d: %s", w.Code, w.Body.String())
	}
	var created dto.FolderResponse
	json.Unmarshal(w.Body.Bytes(), &created)
	if created.Name != "Dynamic Programming" || created.ID == 0 {
		t.Fatalf("unexpected created folder: %+v", created)
	}

	// 5. GET - list folders
	w = testutil.PerformRequest(r, "GET", baseURL, token1, nil)
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on list folders, got %d", w.Code)
	}
	json.Unmarshal(w.Body.Bytes(), &list)
	if len(list) != 1 || list[0].ID != created.ID {
		t.Fatalf("expected 1 folder with ID %d, got %+v", created.ID, list)
	}

	// 6. PUT - rename folder
	folderURL := fmt.Sprintf("%s/%d", baseURL, created.ID)
	w = testutil.PerformRequest(r, "PUT", folderURL, token1, map[string]string{"name": "DP & Memoization"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on rename folder, got %d: %s", w.Code, w.Body.String())
	}
	var updated dto.FolderResponse
	json.Unmarshal(w.Body.Bytes(), &updated)
	if updated.Name != "DP & Memoization" {
		t.Fatalf("expected name 'DP & Memoization', got %q", updated.Name)
	}

	// 7. PUT - user2 cannot rename user1's folder -> 404
	w = testutil.PerformRequest(r, "PUT", folderURL, token2, map[string]string{"name": "Hacked"})
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 renaming user1's folder, got %d", w.Code)
	}

	// 8. DELETE - user2 cannot delete user1's folder -> 404
	w = testutil.PerformRequest(r, "DELETE", folderURL, token2, nil)
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for user2 deleting user1's folder, got %d", w.Code)
	}

	// 9. DELETE - user1 deletes folder -> 204
	w = testutil.PerformRequest(r, "DELETE", folderURL, token1, nil)
	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on delete folder, got %d", w.Code)
	}

	// 10. GET - list is empty again
	w = testutil.PerformRequest(r, "GET", baseURL, token1, nil)
	json.Unmarshal(w.Body.Bytes(), &list)
	if len(list) != 0 {
		t.Fatalf("expected 0 folders after deletion, got %d", len(list))
	}
}
