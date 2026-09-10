package security_test

import (
	"testing"

	"github.com/abde1khaliq/korasa/internal/security"
)

func TestPasswordHashing(t *testing.T) {
	raw := "super-secure-password-123"

	hash1, err := security.HashPassword(raw)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	if hash1 == "" {
		t.Fatalf("expected non-empty hash")
	}

	// Verify CheckPassword succeeds on correct password
	if !security.CheckPassword(raw, hash1) {
		t.Fatalf("expected CheckPassword to return true for matching password")
	}

	// Verify CheckPassword fails on wrong password
	if security.CheckPassword("wrong-password", hash1) {
		t.Fatalf("expected CheckPassword to return false for wrong password")
	}

	// Bcrypt salt ensures two hashes of the same password are distinct
	hash2, err := security.HashPassword(raw)
	if err != nil {
		t.Fatalf("failed to hash password 2nd time: %v", err)
	}
	if hash1 == hash2 {
		t.Fatalf("expected distinct hashes due to random salting, got identical hashes")
	}
}
