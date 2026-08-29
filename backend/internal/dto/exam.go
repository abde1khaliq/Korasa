package dto

import (
	"strings"

	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

type AttemptSummary struct {
	ID           int     `json:"id"`
	CompletedAt  *string `json:"completed_at"`
	CorrectCount int     `json:"correct_count"`
	TotalCount   int     `json:"total_count"`
}

type ExamResponse struct {
	ID               int             `json:"id"`
	Name             string          `json:"name"`
	Type             string          `json:"type"`
	ScopeType        string          `json:"scope_type"`
	ScopeID          int             `json:"scope_id"`
	Difficulties     []string        `json:"difficulties"`
	QuestionCount    int             `json:"question_count"`
	TimeLimitMinutes *int            `json:"time_limit_minutes"`
	AttemptCount     int             `json:"attempt_count"`
	LastAttempt      *AttemptSummary `json:"last_attempt"`
}

// One query per exam for attempt stats — same trade-off the codebase
// already accepts in ToFolderListResponse. Fine at current scale; revisit
// with a batched join if exam lists grow large.
func ToExamResponse(e models.Exam, db *gorm.DB) ExamResponse {
	var attemptCount int64
	db.Model(&models.ExamAttempt{}).Where("exam_id = ?", e.ID).Count(&attemptCount)

	var lastPtr *AttemptSummary
	var last models.ExamAttempt
	if err := db.Where("exam_id = ? AND completed_at IS NOT NULL", e.ID).
		Order("completed_at DESC").First(&last).Error; err == nil {
		completedStr := last.CompletedAt.Format("2006-01-02T15:04:05Z07:00")
		lastPtr = &AttemptSummary{
			ID:           last.ID,
			CompletedAt:  &completedStr,
			CorrectCount: last.CorrectCount,
			TotalCount:   last.TotalCount,
		}
	}

	return ExamResponse{
		ID:               e.ID,
		Name:             e.Name,
		Type:             e.Type,
		ScopeType:        e.ScopeType,
		ScopeID:          e.ScopeID,
		Difficulties:     strings.Split(e.Difficulties, ","),
		QuestionCount:    e.QuestionCount,
		TimeLimitMinutes: e.TimeLimitMinutes,
		AttemptCount:     int(attemptCount),
		LastAttempt:      lastPtr,
	}
}

func ToExamListResponse(exams []models.Exam, db *gorm.DB) []ExamResponse {
	resp := make([]ExamResponse, len(exams))
	for i, e := range exams {
		resp[i] = ToExamResponse(e, db)
	}
	return resp
}
