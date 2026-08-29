package models

type ExamQuestion struct {
	ID         int `gorm:"primaryKey"`
	ExamID     int `gorm:"not null;uniqueIndex:idx_exam_question" validate:"required"`
	QuestionID int `gorm:"not null;uniqueIndex:idx_exam_question" validate:"required"`
	Position   int `gorm:"not null"`
}
