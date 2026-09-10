package admin_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/abde1khaliq/korasa/internal/admin"
	"github.com/gin-gonic/gin"
)

func TestDashboardHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/admin", admin.DashboardHandler)

	req, _ := http.NewRequest("GET", "/admin", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	body := w.Body.String()
	if !strings.Contains(body, "Korasa Admin") {
		t.Fatalf("expected body to contain 'Korasa Admin', got: %s", body)
	}
}
