package models

import "time"

type Lesson struct {
	ID              int       `gorm:"primaryKey"`
	UserID          int       `gorm:"not null" validate:"required"`
	SubjectID       *int      `gorm:"index"`
	Subject         *Subject  `gorm:"foreignKey:SubjectID"`
	Title           string    `gorm:"not null;size:128" validate:"required,min=1,max=128"`
	Description     string    `gorm:"type:text" validate:"max=2000"`
	DayOfWeek       int       `gorm:"not null" validate:"min=0,max=6"` // 0=Sunday, 1=Monday, ..., 6=Saturday
	StartTime       string    `gorm:"not null;size:5" validate:"required"` // "HH:mm"
	EndTime         *string   `gorm:"size:5"`                              // "HH:mm"
	Location        string    `gorm:"size:255" validate:"max=255"`
	Color           string    `gorm:"size:32" validate:"max=32"`
	ReminderMinutes int       `gorm:"not null;default:15"`
	CreatedAt       time.Time `gorm:"not null;default:now()"`
	UpdatedAt       time.Time `gorm:"not null;default:now()"`
}

type LessonInput struct {
	SubjectID       *int    `json:"subject_id"`
	Title           string  `json:"title" validate:"required,min=1,max=128"`
	Description     string  `json:"description" validate:"max=2000"`
	DayOfWeek       *int    `json:"day_of_week" validate:"omitempty,min=0,max=6"`
	DaysOfWeek      []int   `json:"days_of_week"` // For batch creating across multiple recurring days
	StartTime       string  `json:"start_time" validate:"required"` // "HH:mm"
	EndTime         *string `json:"end_time"`                       // "HH:mm"
	Location        string  `json:"location" validate:"max=255"`
	Color           string  `json:"color" validate:"max=32"`
	ReminderMinutes *int    `json:"reminder_minutes"`
}
