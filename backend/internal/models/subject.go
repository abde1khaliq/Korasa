package models

import "time"

type Subject struct {
	ID        int       `gorm:"primaryKey"`
	Name      string    `gorm:"uniqueIndex:idx_user_subject_name;not null;size:128" validate:"required,min=1,max=128"`
	UserID    int       `gorm:"uniqueIndex:idx_user_subject_name;not null" validate:"required"`
	CreatedAt time.Time `gorm:"not null;default:now()"`
	UpdatedAt time.Time `gorm:"not null;default:now()"`
}

type SubjectInput struct {
	Name string `validate:"required,min=1,max=128"`
}
