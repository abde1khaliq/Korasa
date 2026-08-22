package services

import (
	"context"
	"fmt"
	"io"

	"github.com/abde1khaliq/korasa/config"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

func InitCloudinary() error {
	c, err := cloudinary.NewFromParams(
		config.App.CloudinaryCloudName,
		config.App.CloudinaryAPIKey,
		config.App.CloudinaryAPISecret,
	)
	if err != nil {
		return fmt.Errorf("cloudinary init failed: %w", err)
	}
	cld = c
	return nil
}

// Capped to 1600px wide with auto quality — this is not optional polish,
// it's what keeps a single free-tier account (25 credits/month, where
// storage + bandwidth + transformations all draw from the same pool)
// from being exhausted by a handful of full-resolution phone photos.
func UploadQuestionImage(ctx context.Context, file io.Reader) (string, error) {
	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:         "korasa/questions",
		ResourceType:   "image",
		Transformation: "w_1600,c_limit,q_auto:good",
	})
	if err != nil {
		return "", fmt.Errorf("cloudinary upload failed: %w", err)
	}
	return resp.SecureURL, nil
}
