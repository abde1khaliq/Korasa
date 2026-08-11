package models

type Subject struct {
	ID     int    `gorm:"primaryKey"`
	Name   string `gorm:"uniqueIndex:idx_user_subject_name;not null;size:128" validate:"required,min=1,max=128"`
	UserID int    `gorm:"uniqueIndex:idx_user_subject_name;not null" validate:"required"`
}

type SubjectInput struct {
	Name string `validate:"required,min=1,max=128"`
}
