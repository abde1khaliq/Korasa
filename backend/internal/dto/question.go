package dto

import "github.com/abde1khaliq/korasa/internal/models"

type QuestionResponse struct {
	ID         int    `json:"id"`
	Text       string `json:"text"`
	Answer     string `json:"answer"`
	Difficulty string `json:"difficulty"`
	Note       string `json:"note"`
	FolderID   int    `json:"folder_id"`
}

func ToQuestionResponse(q models.Question) QuestionResponse {
	return QuestionResponse{
		ID:         q.ID,
		Text:       q.Text,
		Answer:     q.Answer,
		Difficulty: q.Difficulty,
		Note:       q.Note,
		FolderID:   q.FolderID,
	}
}

func ToQuestionListResponse(questions []models.Question) []QuestionResponse {
	resp := make([]QuestionResponse, len(questions))
	for i, q := range questions {
		resp[i] = ToQuestionResponse(q)
	}
	return resp
}
