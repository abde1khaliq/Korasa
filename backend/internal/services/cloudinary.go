package services

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/url"
	"path"
	"regexp"
	"strings"

	"github.com/abde1khaliq/korasa/config"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

var cld *cloudinary.Cloudinary

// InitCloudinary initializes the Cloudinary client with credentials from app config.
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

// UploadQuestionImage uploads a question's image reader to Cloudinary under the "korasa/questions" folder.
func UploadQuestionImage(ctx context.Context, file io.Reader) (string, error) {
	if cld == nil {
		return "", errors.New("cloudinary is not initialized")
	}
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

// ExtractPublicID extracts the Cloudinary public ID from a Cloudinary image URL or public ID string.
// It strips domain, resource/delivery path, transformations, version prefixes, and file extensions.
func ExtractPublicID(imageURL string) (string, error) {
	trimmed := strings.TrimSpace(imageURL)
	if trimmed == "" {
		return "", errors.New("image url cannot be empty")
	}

	var pathStr string
	if strings.Contains(trimmed, "://") {
		u, err := url.Parse(trimmed)
		if err != nil {
			return "", fmt.Errorf("invalid image url: %w", err)
		}
		pathStr = u.Path
	} else {
		pathStr = trimmed
	}

	pathStr = strings.Trim(pathStr, "/")

	deliveryTypes := []string{"/upload/", "/authenticated/", "/private/"}
	var rest string
	foundDelivery := false
	for _, dt := range deliveryTypes {
		if idx := strings.Index("/"+pathStr, dt); idx != -1 {
			rest = pathStr[idx+len(dt)-1:]
			foundDelivery = true
			break
		}
	}

	if !foundDelivery {
		if strings.HasPrefix(pathStr, "upload/") {
			rest = strings.TrimPrefix(pathStr, "upload/")
			foundDelivery = true
		} else {
			rest = pathStr
		}
	}

	rawSegments := strings.Split(rest, "/")
	var segments []string
	for _, s := range rawSegments {
		if s != "" {
			segments = append(segments, s)
		}
	}

	if len(segments) == 0 {
		return "", errors.New("unable to extract public ID from url")
	}

	versionRegex := regexp.MustCompile(`^v\d+$`)
	startIndex := -1

	for i, seg := range segments {
		if versionRegex.MatchString(seg) {
			startIndex = i + 1
			break
		}
	}

	if startIndex != -1 {
		if startIndex >= len(segments) {
			return "", errors.New("url contains version but no public id after version")
		}
		segments = segments[startIndex:]
	} else {
		korasaIdx := -1
		for i, seg := range segments {
			if seg == "korasa" {
				korasaIdx = i
				break
			}
		}
		if korasaIdx != -1 {
			segments = segments[korasaIdx:]
		} else if foundDelivery {
			firstNonTransform := 0
			for i, seg := range segments {
				if isTransformationSegment(seg) {
					firstNonTransform = i + 1
				} else {
					break
				}
			}
			if firstNonTransform < len(segments) {
				segments = segments[firstNonTransform:]
			}
		}
	}

	joined := strings.Join(segments, "/")
	if joined == "" {
		return "", errors.New("empty public id extracted")
	}

	ext := path.Ext(joined)
	publicID := strings.TrimSuffix(joined, ext)
	if publicID == "" {
		return "", errors.New("invalid public id after removing extension")
	}

	return publicID, nil
}

func isTransformationSegment(seg string) bool {
	if strings.Contains(seg, ",") {
		return true
	}
	matched, _ := regexp.MatchString(`^[a-z]{1,3}_`, seg)
	return matched
}

// DeleteQuestionImage deletes a question's image from Cloudinary using its image URL or public ID.
func DeleteQuestionImage(ctx context.Context, imageURL string) error {
	if imageURL == "" {
		return nil
	}
	if cld == nil {
		return errors.New("cloudinary is not initialized")
	}
	publicID, err := ExtractPublicID(imageURL)
	if err != nil {
		return fmt.Errorf("failed to extract public ID: %w", err)
	}

	resp, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID:     publicID,
		ResourceType: "image",
		Invalidate:   api.Bool(true),
	})
	if err != nil {
		return fmt.Errorf("cloudinary destroy failed: %w", err)
	}
	if resp.Result != "ok" && resp.Result != "not found" {
		return fmt.Errorf("cloudinary destroy returned unexpected result: %s", resp.Result)
	}
	return nil
}

