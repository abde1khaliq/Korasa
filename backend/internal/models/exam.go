package models

import "time"

type Exam struct {
	ID               int       `gorm:"primaryKey"`
	UserID           int       `gorm:"not null;index" validate:"required"`
	Name             string    `gorm:"not null;size:128" validate:"required,min=1,max=128"`
	Type             string    `gorm:"not null;size:16" validate:"required,oneof=practice timed full"`
	ScopeType        string    `gorm:"not null;size:16" validate:"required,oneof=subject folder"`
	ScopeID          int       `gorm:"not null" validate:"required"`
	Difficulties     string    `gorm:"not null;size:32"` // comma-separated: "easy,medium,hard"
	QuestionCount    int       `gorm:"not null" validate:"required,min=1"`
	TimeLimitMinutes *int      `gorm:""`
	CreatedAt        time.Time `gorm:"not null;default:now()"`
	UpdatedAt        time.Time `gorm:"not null;default:now()"`
}

// QuestionCount and TimeLimitMinutes are validated by hand in the handler
// rather than with struct tags — their requiredness depends on Type
// ("full" ignores question_count, only "timed" requires a time limit),
// and cross-field validator tags for that are fragile enough to get wrong
// silently. See CreateExam in exam_service.go.
type ExamInput struct {
	Name             string   `json:"name" validate:"required,min=1,max=128"`
	Type             string   `json:"type" validate:"required,oneof=practice timed full"`
	ScopeType        string   `json:"scope_type" validate:"required,oneof=subject folder"`
	ScopeID          int      `json:"scope_id" validate:"required"`
	Difficulties     []string `json:"difficulties" validate:"required,min=1,dive,oneof=easy medium hard"`
	QuestionCount    int      `json:"question_count"`
	TimeLimitMinutes *int     `json:"time_limit_minutes"`
}

type RenameExamInput struct {
	Name string `json:"name" validate:"required,min=1,max=128"`
}
