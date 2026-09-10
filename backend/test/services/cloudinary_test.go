package services_test

import (
	"testing"

	"github.com/abde1khaliq/korasa/internal/services"
)

func TestExtractPublicID(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
		wantErr  bool
	}{
		{
			name:     "Full URL with version and folder",
			input:    "https://res.cloudinary.com/mycloud/image/upload/v1612345678/korasa/questions/sample_abc123.jpg",
			expected: "korasa/questions/sample_abc123",
			wantErr:  false,
		},
		{
			name:     "URL with transformations and version",
			input:    "https://res.cloudinary.com/mycloud/image/upload/w_1600,c_limit,q_auto:good/v1612345678/korasa/questions/sample_xyz789.png",
			expected: "korasa/questions/sample_xyz789",
			wantErr:  false,
		},
		{
			name:     "URL without version tag",
			input:    "https://res.cloudinary.com/mycloud/image/upload/korasa/questions/item_999.webp",
			expected: "korasa/questions/item_999",
			wantErr:  false,
		},
		{
			name:     "Direct public ID without domain",
			input:    "korasa/questions/direct_id.jpg",
			expected: "korasa/questions/direct_id",
			wantErr:  false,
		},
		{
			name:     "Empty string",
			input:    "",
			expected: "",
			wantErr:  true,
		},
		{
			name:     "Whitespace only",
			input:    "   ",
			expected: "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := services.ExtractPublicID(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("ExtractPublicID(%q) error = %v, wantErr = %v", tt.input, err, tt.wantErr)
			}
			if !tt.wantErr && got != tt.expected {
				t.Fatalf("ExtractPublicID(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}
