package dto

import (
	"time"

	"github.com/abde1khaliq/korasa/internal/models"
)

var dayNames = [7]string{
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
}

type LessonResponse struct {
	ID              int     `json:"id"`
	SubjectID       *int    `json:"subject_id"`
	SubjectName     *string `json:"subject_name"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	DayOfWeek       int     `json:"day_of_week"`
	DayName         string  `json:"day_name"`
	StartTime       string  `json:"start_time"`
	EndTime         *string `json:"end_time"`
	Location        string  `json:"location"`
	Color           string  `json:"color"`
	ReminderMinutes int     `json:"reminder_minutes"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
}

// ToLessonResponse transforms a Lesson model into a client-safe DTO.
func ToLessonResponse(l models.Lesson) LessonResponse {
	var subjectName *string
	if l.Subject != nil {
		subjectName = &l.Subject.Name
	}

	dayName := "Unknown"
	if l.DayOfWeek >= 0 && l.DayOfWeek < 7 {
		dayName = dayNames[l.DayOfWeek]
	}

	return LessonResponse{
		ID:              l.ID,
		SubjectID:       l.SubjectID,
		SubjectName:     subjectName,
		Title:           l.Title,
		Description:     l.Description,
		DayOfWeek:       l.DayOfWeek,
		DayName:         dayName,
		StartTime:       l.StartTime,
		EndTime:         l.EndTime,
		Location:        l.Location,
		Color:           l.Color,
		ReminderMinutes: l.ReminderMinutes,
		CreatedAt:       l.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       l.UpdatedAt.Format(time.RFC3339),
	}
}

// ToLessonListResponse transforms a slice of Lesson models into a slice of DTOs.
func ToLessonListResponse(lessons []models.Lesson) []LessonResponse {
	resp := make([]LessonResponse, len(lessons))
	for i, l := range lessons {
		resp[i] = ToLessonResponse(l)
	}
	return resp
}
