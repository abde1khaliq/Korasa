package dto

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

type SubjectResponse struct {
	ID            int    `json:"id"`
	Name          string `json:"name"`
	QuestionCount int    `json:"question_count"`
	FolderCount   int    `json:"folder_count"`
}

func ToSubjectResponse(s models.Subject, db *gorm.DB) SubjectResponse {
	var questionCount int64
	var folderCount int64

	db.Model(&models.Folder{}).Where("subject_id = ?", s.ID).Count(&folderCount)
	db.Model(&models.Question{}).Joins("JOIN folders ON folders.id = questions.folder_id").Where("folders.subject_id = ?", s.ID).Count(&questionCount)

	return SubjectResponse{
		ID:            s.ID,
		Name:          s.Name,
		QuestionCount: int(questionCount),
		FolderCount:   int(folderCount),
	}
}

func ToSubjectListResponse(subjects []models.Subject, db *gorm.DB) []SubjectResponse {
	folderCounts := make(map[int]int64)
	var folderResults []struct {
		SubjectID int
		Count     int64
	}
	db.Model(&models.Folder{}).
		Select("subject_id, COUNT(*) as count").
		Group("subject_id").
		Scan(&folderResults)
	for _, r := range folderResults {
		folderCounts[r.SubjectID] = r.Count
	}

	questionCounts := make(map[int]int64)
	var questionResults []struct {
		SubjectID int
		Count     int64
	}
	db.Table("questions").
		Select("folders.subject_id, COUNT(*) as count").
		Joins("JOIN folders ON folders.id = questions.folder_id").
		Group("folders.subject_id").
		Scan(&questionResults)
	for _, r := range questionResults {
		questionCounts[r.SubjectID] = r.Count
	}

	resp := make([]SubjectResponse, len(subjects))
	for i, s := range subjects {
		resp[i] = SubjectResponse{
			ID:            s.ID,
			Name:          s.Name,
			FolderCount:   int(folderCounts[s.ID]),
			QuestionCount: int(questionCounts[s.ID]),
		}
	}
	return resp
}
