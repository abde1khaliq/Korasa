package security

import (
	"crypto/rand"
	"fmt"
	"math/big"
)

const (
	codeUpperBound = 900000
	codeLowerBound = 100000
)

func GenerateVerificationCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(codeUpperBound))
	if err != nil {
		return "", fmt.Errorf("failed to generate verification code: %w", err)
	}
	return fmt.Sprintf("%06d", n.Int64()+codeLowerBound), nil
}
