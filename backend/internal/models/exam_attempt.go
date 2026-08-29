package models

import "time"

type ExamAttempt struct {
	ID           int        `gorm:"primaryKey"`
	ExamID       int        `gorm:"not null;index" validate:"required"`
	UserID       int        `gorm:"not null;index" validate:"required"`
	StartedAt    time.Time  `gorm:"not null;default:now()"`
	CompletedAt  *time.Time `gorm:""`
	CorrectCount int        `gorm:"not null;default:0"`
	TotalCount   int        `gorm:"not null"`
	DurationSecs *int       `gorm:""`
	CreatedAt    time.Time  `gorm:"not null;default:now()"`
	UpdatedAt    time.Time  `gorm:"not null;default:now()"`
}

type ExamAttemptAnswer struct {
	ID         int  `gorm:"primaryKey"`
	AttemptID  int  `gorm:"not null;index" validate:"required"`
	QuestionID int  `gorm:"not null" validate:"required"`
	IsCorrect  bool `gorm:"not null"`
	Position   int  `gorm:"not null"`
}

type SubmitAttemptInput struct {
	Answers []AttemptAnswerInput `json:"answers" validate:"required,min=1,dive"`
}

type AttemptAnswerInput struct {
	QuestionID int  `json:"question_id" validate:"required"`
	IsCorrect  bool `json:"is_correct"`
}
