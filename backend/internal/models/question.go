package models

import "time"

type Question struct {
	ID         int       `gorm:"primaryKey"`
	Text       string    `gorm:"not null;size:2000" validate:"required,min=1,max=2000"`
	Answer     string    `gorm:"not null;size:2000" validate:"required,min=1,max=2000"`
	Difficulty string    `gorm:"not null;size:16" validate:"required,oneof=easy medium hard"`
	Note       string    `gorm:"size:2000"`
	FolderID   int       `gorm:"not null" validate:"required"`
	CreatedAt  time.Time `gorm:"not null;default:now()"`
	UpdatedAt  time.Time `gorm:"not null;default:now()"`
}

type QuestionInput struct {
	Text       string `json:"text" validate:"required,min=1,max=2000"`
	Answer     string `json:"answer" validate:"required,min=1,max=2000"`
	Difficulty string `json:"difficulty" validate:"required,oneof=easy medium hard"`
	Note       string `json:"note" validate:"max=2000"`
}
