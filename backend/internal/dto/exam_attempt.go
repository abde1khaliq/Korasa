package dto

import (
	"time"

	"github.com/abde1khaliq/korasa/internal/models"
)

type AttemptQuestionResponse struct {
	QuestionID int    `json:"question_id"`
	ImageURL   string `json:"image_url"`
	Text       string `json:"text"`
	Answer     string `json:"answer"`
	Difficulty string `json:"difficulty"`
	Note       string `json:"note"`
}

type StartAttemptResponse struct {
	AttemptID        int                       `json:"attempt_id"`
	ExamID           int                       `json:"exam_id"`
	StartedAt        time.Time                 `json:"started_at"`
	TimeLimitMinutes *int                      `json:"time_limit_minutes"`
	Questions        []AttemptQuestionResponse `json:"questions"`
}

type AttemptResponse struct {
	ID           int        `json:"id"`
	ExamID       int        `json:"exam_id"`
	StartedAt    time.Time  `json:"started_at"`
	CompletedAt  *time.Time `json:"completed_at"`
	CorrectCount int        `json:"correct_count"`
	TotalCount   int        `json:"total_count"`
	DurationSecs *int       `json:"duration_secs"`
}

func ToAttemptResponse(a models.ExamAttempt) AttemptResponse {
	return AttemptResponse{
		ID:           a.ID,
		ExamID:       a.ExamID,
		StartedAt:    a.StartedAt,
		CompletedAt:  a.CompletedAt,
		CorrectCount: a.CorrectCount,
		TotalCount:   a.TotalCount,
		DurationSecs: a.DurationSecs,
	}
}

func ToAttemptListResponse(attempts []models.ExamAttempt) []AttemptResponse {
	resp := make([]AttemptResponse, len(attempts))
	for i, a := range attempts {
		resp[i] = ToAttemptResponse(a)
	}
	return resp
}
