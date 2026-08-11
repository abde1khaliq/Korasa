package dto

import "github.com/abde1khaliq/korasa/internal/models"

type FolderResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func ToFolderResponse(f models.Folder) FolderResponse {
	return FolderResponse{
		ID:   f.ID,
		Name: f.Name,
	}
}

func ToFolderListResponse(folders []models.Folder) []FolderResponse {
	resp := make([]FolderResponse, len(folders))
	for i, f := range folders {
		resp[i] = ToFolderResponse(f)
	}
	return resp
}
