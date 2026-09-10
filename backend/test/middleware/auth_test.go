package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/abde1khaliq/korasa/test/testutil"
	"github.com/gin-gonic/gin"
)

func TestRequireAuth_MissingToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	testutil.InitTestConfig()

	r := gin.New()
	r.GET("/protected", middleware.RequireAuth(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing token, got %d", w.Code)
	}
}

func TestRequireAuth_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	testutil.InitTestConfig()
	db := testutil.SetupTestDB(t)

	accessToken, _, err := security.GenerateTokens(42)
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	r := gin.New()
	r.GET("/protected", middleware.RequireAuth(db), func(c *gin.Context) {
		uid := c.GetInt("userID")
		c.JSON(http.StatusOK, gin.H{"userID": uid})
	})

	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestRequireAdmin_ForbiddenForNormalUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	testutil.InitTestConfig()
	db := testutil.SetupTestDB(t)

	_, normalToken := testutil.SeedUser(t, db, "regular", "regular@test.com", "user")

	r := gin.New()
	r.GET("/admin-only", middleware.RequireAuth(db), middleware.RequireAdmin(db), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "admin_granted"})
	})

	req, _ := http.NewRequest("GET", "/admin-only", nil)
	req.Header.Set("Authorization", "Bearer "+normalToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for non-admin user, got %d", w.Code)
	}
}

func TestRequireAdmin_AllowedForAdminUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	testutil.InitTestConfig()
	db := testutil.SetupTestDB(t)

	_, adminToken := testutil.SeedUser(t, db, "superadmin", "admin@test.com", "admin")

	r := gin.New()
	r.GET("/admin-only", middleware.RequireAuth(db), middleware.RequireAdmin(db), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "admin_granted"})
	})

	req, _ := http.NewRequest("GET", "/admin-only", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for admin user, got %d: %s", w.Code, w.Body.String())
	}
}
