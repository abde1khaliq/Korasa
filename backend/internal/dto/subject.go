package dto

import "github.com/abde1khaliq/korasa/internal/models"

type SubjectResponse struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func ToSubjectResponse(s models.Subject) SubjectResponse {
	return SubjectResponse{
		ID:   s.ID,
		Name: s.Name,
	}
}

func ToSubjectListResponse(subjects []models.Subject) []SubjectResponse {
	resp := make([]SubjectResponse, len(subjects))
	for i, s := range subjects {
		resp[i] = ToSubjectResponse(s)
	}
	return resp
}
