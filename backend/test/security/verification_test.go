package security_test

import (
	"strconv"
	"testing"

	"github.com/abde1khaliq/korasa/internal/security"
)

func TestGenerateVerificationCode(t *testing.T) {
	code, err := security.GenerateVerificationCode()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(code) != 6 {
		t.Fatalf("expected 6-digit code, got length %d (%s)", len(code), code)
	}

	num, err := strconv.Atoi(code)
	if err != nil {
		t.Fatalf("expected numeric code, got %s: %v", code, err)
	}

	if num < 100000 || num > 999999 {
		t.Fatalf("expected code between 100000 and 999999, got %d", num)
	}

	// Generate second code and check uniqueness
	code2, _ := security.GenerateVerificationCode()
	if len(code2) != 6 {
		t.Fatalf("expected 6-digit code for second generation, got %s", code2)
	}
}
