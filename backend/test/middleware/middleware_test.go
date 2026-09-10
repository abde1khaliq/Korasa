package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/abde1khaliq/korasa/internal/middleware"
	"github.com/gin-gonic/gin"
)

func TestSecurityHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(middleware.SecurityHeaders())
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	req, _ := http.NewRequest("GET", "/ping", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	expectedHeaders := map[string]string{
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options":        "DENY",
		"X-XSS-Protection":       "0",
		"Referrer-Policy":        "strict-origin-when-cross-origin",
		"Permissions-Policy":     "geolocation=(), camera=(), microphone=()",
	}

	for header, expectedVal := range expectedHeaders {
		actualVal := w.Header().Get(header)
		if actualVal != expectedVal {
			t.Errorf("header %s: expected %q, got %q", header, expectedVal, actualVal)
		}
	}
}

func TestRateLimit_AllowsAndBlocks(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// Rate limit: 2 requests per 100ms
	r.Use(middleware.RateLimit(2, 100*time.Millisecond))
	r.GET("/limited", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	// 1st request should succeed
	req1, _ := http.NewRequest("GET", "/limited", nil)
	req1.RemoteAddr = "192.168.1.100:1234"
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusOK {
		t.Fatalf("request 1: expected 200, got %d", w1.Code)
	}

	// 2nd request should succeed
	req2, _ := http.NewRequest("GET", "/limited", nil)
	req2.RemoteAddr = "192.168.1.100:1234"
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Fatalf("request 2: expected 200, got %d", w2.Code)
	}

	// 3rd request should be blocked (429)
	req3, _ := http.NewRequest("GET", "/limited", nil)
	req3.RemoteAddr = "192.168.1.100:1234"
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	if w3.Code != http.StatusTooManyRequests {
		t.Fatalf("request 3: expected 429, got %d", w3.Code)
	}
	if w3.Header().Get("Retry-After") == "" {
		t.Fatalf("expected Retry-After header on 429 response")
	}

	// Different IP should still succeed
	reqDiffIP, _ := http.NewRequest("GET", "/limited", nil)
	reqDiffIP.RemoteAddr = "192.168.1.101:1234"
	wDiff := httptest.NewRecorder()
	r.ServeHTTP(wDiff, reqDiffIP)
	if wDiff.Code != http.StatusOK {
		t.Fatalf("request from different IP: expected 200, got %d", wDiff.Code)
	}

	// Wait for window to expire, then should succeed again
	time.Sleep(120 * time.Millisecond)
	req4, _ := http.NewRequest("GET", "/limited", nil)
	req4.RemoteAddr = "192.168.1.100:1234"
	w4 := httptest.NewRecorder()
	r.ServeHTTP(w4, req4)
	if w4.Code != http.StatusOK {
		t.Fatalf("request after cooldown: expected 200, got %d", w4.Code)
	}
}
