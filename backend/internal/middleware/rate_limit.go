package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientRecord struct {
	timestamps []time.Time
}

type IPRateLimiter struct {
	mu      sync.Mutex
	clients map[string]*clientRecord
	limit   int
	window  time.Duration
}

// NewIPRateLimiter creates a new rate limiter that allows up to limit requests per window per IP.
func NewIPRateLimiter(limit int, window time.Duration) *IPRateLimiter {
	limiter := &IPRateLimiter{
		clients: make(map[string]*clientRecord),
		limit:   limit,
		window:  window,
	}

	// Periodic background cleanup of stale entries
	go func() {
		ticker := time.NewTicker(window * 2)
		for range ticker.C {
			limiter.cleanup()
		}
	}()

	return limiter
}

func (l *IPRateLimiter) allow(ip string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	boundary := now.Add(-l.window)

	rec, exists := l.clients[ip]
	if !exists {
		l.clients[ip] = &clientRecord{
			timestamps: []time.Time{now},
		}
		return true
	}

	// Filter out timestamps older than the sliding window
	valid := rec.timestamps[:0]
	for _, t := range rec.timestamps {
		if t.After(boundary) {
			valid = append(valid, t)
		}
	}
	rec.timestamps = valid

	if len(rec.timestamps) >= l.limit {
		return false
	}

	rec.timestamps = append(rec.timestamps, now)
	return true
}

func (l *IPRateLimiter) cleanup() {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	boundary := now.Add(-l.window)

	for ip, rec := range l.clients {
		valid := rec.timestamps[:0]
		for _, t := range rec.timestamps {
			if t.After(boundary) {
				valid = append(valid, t)
			}
		}
		if len(valid) == 0 {
			delete(l.clients, ip)
		} else {
			rec.timestamps = valid
		}
	}
}

// RateLimit returns a Gin middleware for rate limiting by client IP.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	limiter := NewIPRateLimiter(limit, window)
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		if !limiter.allow(clientIP) {
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "too many requests, please try again later",
			})
			return
		}
		c.Next()
	}
}
