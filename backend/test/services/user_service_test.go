package services_test

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/abde1khaliq/korasa/internal/api"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/abde1khaliq/korasa/test/testutil"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupUserRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	userGroup := r.Group("/auth")
	api.UserRouters(userGroup, db)
	return r
}

func TestUserService_LoginAndRefresh(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupUserRouter(db)

	hashedPassword, _ := security.HashPassword("secretPassword123")
	user := models.User{
		Username: "auth_tester",
		Email:    "tester@korasa.study",
		Password: hashedPassword,
		Role:     "user",
	}
	db.Create(&user)

	// 1. POST /auth/login - missing fields -> 400
	w := testutil.PerformRequest(r, "POST", "/auth/login", "", map[string]string{
		"email": "not_an_email",
	})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on invalid login payload, got %d", w.Code)
	}

	// 2. POST /auth/login - nonexistent email -> 401
	w = testutil.PerformRequest(r, "POST", "/auth/login", "", map[string]string{
		"email":    "nonexistent@korasa.study",
		"password": "secretPassword123",
	})
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for nonexistent email, got %d", w.Code)
	}

	// 3. POST /auth/login - wrong password -> 401
	w = testutil.PerformRequest(r, "POST", "/auth/login", "", map[string]string{
		"email":    "tester@korasa.study",
		"password": "wrongPassword123",
	})
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for wrong password, got %d", w.Code)
	}

	// 4. POST /auth/login - success -> 200
	w = testutil.PerformRequest(r, "POST", "/auth/login", "", map[string]string{
		"email":    "tester@korasa.study",
		"password": "secretPassword123",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on login success, got %d: %s", w.Code, w.Body.String())
	}
	var loginResp struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
		User         struct {
			ID       int    `json:"id"`
			Email    string `json:"email"`
			Username string `json:"username"`
			Role     string `json:"role"`
		} `json:"user"`
	}
	json.Unmarshal(w.Body.Bytes(), &loginResp)
	if loginResp.AccessToken == "" || loginResp.RefreshToken == "" || loginResp.User.Email != "tester@korasa.study" {
		t.Fatalf("unexpected login response: %+v", loginResp)
	}

	// 5. POST /auth/refresh - missing refresh token -> 400
	w = testutil.PerformRequest(r, "POST", "/auth/refresh", "", map[string]string{})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on missing refresh token, got %d", w.Code)
	}

	// 6. POST /auth/refresh - invalid refresh token -> 401
	w = testutil.PerformRequest(r, "POST", "/auth/refresh", "", map[string]string{
		"refreshToken": "not.a.valid.jwt",
	})
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 on invalid refresh token, got %d", w.Code)
	}

	// 7. POST /auth/refresh - valid refresh token -> 200
	w = testutil.PerformRequest(r, "POST", "/auth/refresh", "", map[string]string{
		"refreshToken": loginResp.RefreshToken,
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on refresh token, got %d: %s", w.Code, w.Body.String())
	}
	var refreshResp struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
	}
	json.Unmarshal(w.Body.Bytes(), &refreshResp)
	if refreshResp.AccessToken == "" || refreshResp.RefreshToken == "" {
		t.Fatalf("expected new tokens from refresh, got: %+v", refreshResp)
	}
}

func TestUserService_CompleteOnboarding(t *testing.T) {
	db := testutil.SetupTestDB(t)
	r := setupUserRouter(db)

	u, token := testutil.SeedUser(t, db, "onboard_user", "onboard@test.com", "user")

	// 1. Without auth -> 401
	w := testutil.PerformRequest(r, "PATCH", "/auth/onboarding-complete", "", nil)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 without auth, got %d", w.Code)
	}

	// 2. With auth -> 204
	w = testutil.PerformRequest(r, "PATCH", "/auth/onboarding-complete", token, nil)
	if w.Code != http.StatusNoContent {
		t.Fatalf("expected 204 on complete onboarding, got %d: %s", w.Code, w.Body.String())
	}

	// Verify in DB
	var updatedUser models.User
	db.First(&updatedUser, u.ID)
	if !updatedUser.HasCompletedOnboarding {
		t.Fatalf("expected has_completed_onboarding to be true in DB")
	}
}
