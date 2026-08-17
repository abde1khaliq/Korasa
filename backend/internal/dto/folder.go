package dto

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

type FolderResponse struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	QuestionCount int    `json:"question_count"`
}

func ToFolderResponse(f models.Folder, db *gorm.DB) FolderResponse {
	var questionCount int64

	db.Model(&models.Question{}).Where("folder_id = ?", f.ID).Count(&questionCount)

	return FolderResponse{
		ID:            f.ID,
		Name:          f.Name,
		QuestionCount: int(questionCount),
	}
}

func ToFolderListResponse(folders []models.Folder, db *gorm.DB) []FolderResponse {
	resp := make([]FolderResponse, len(folders))
	for i, f := range folders {
		resp[i] = ToFolderResponse(f, db)
	}
	return resp
}
