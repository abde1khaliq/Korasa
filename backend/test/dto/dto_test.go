package dto_test

import (
	"testing"
	"time"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/test/testutil"
)

func TestDTO_Question(t *testing.T) {
	q := models.Question{
		ID:         1,
		ImageURL:   "https://example.com/img.png",
		Text:       "Question text",
		Answer:     "Answer text",
		Difficulty: "easy",
		Note:       "Note text",
		FolderID:   10,
	}

	resp := dto.ToQuestionResponse(q)
	if resp.ID != 1 || resp.ImageURL != "https://example.com/img.png" || resp.Answer != "Answer text" {
		t.Fatalf("unexpected question response: %+v", resp)
	}

	list := dto.ToQuestionListResponse([]models.Question{q})
	if len(list) != 1 || list[0].ID != 1 {
		t.Fatalf("unexpected question list response: %+v", list)
	}
}

func TestDTO_Lesson(t *testing.T) {
	subName := "Computer Science"
	sub := models.Subject{Name: subName}
	now := time.Now()
	l := models.Lesson{
		ID:              5,
		Subject:         &sub,
		Title:           "Lecture 1",
		DayOfWeek:       1, // Monday
		StartTime:       "09:00",
		ReminderMinutes: 15,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	resp := dto.ToLessonResponse(l)
	if resp.ID != 5 || resp.DayName != "Monday" || *resp.SubjectName != subName {
		t.Fatalf("unexpected lesson response: %+v", resp)
	}

	list := dto.ToLessonListResponse([]models.Lesson{l})
	if len(list) != 1 || list[0].DayName != "Monday" {
		t.Fatalf("unexpected lesson list response: %+v", list)
	}
}

func TestDTO_Attempt(t *testing.T) {
	now := time.Now()
	dur := 120
	a := models.ExamAttempt{
		ID:           3,
		ExamID:       10,
		StartedAt:    now,
		CompletedAt:  &now,
		CorrectCount: 8,
		TotalCount:   10,
		DurationSecs: &dur,
	}

	resp := dto.ToAttemptResponse(a)
	if resp.ID != 3 || resp.CorrectCount != 8 || *resp.DurationSecs != 120 {
		t.Fatalf("unexpected attempt response: %+v", resp)
	}

	list := dto.ToAttemptListResponse([]models.ExamAttempt{a})
	if len(list) != 1 || list[0].CorrectCount != 8 {
		t.Fatalf("unexpected attempt list response: %+v", list)
	}
}

func TestDTO_FolderAndSubject(t *testing.T) {
	db := testutil.SetupTestDB(t)

	u, _ := testutil.SeedUser(t, db, "dtouser", "dto@test.com", "user")
	sub := models.Subject{UserID: u.ID, Name: "Algorithms"}
	db.Create(&sub)

	folder := models.Folder{SubjectID: sub.ID, Name: "Sorting"}
	db.Create(&folder)

	q := models.Question{
		FolderID:   folder.ID,
		ImageURL:   "https://example.com/sort.png",
		Answer:     "O(n log n)",
		Difficulty: "medium",
	}
	db.Create(&q)

	folderResp := dto.ToFolderResponse(folder, db)
	if folderResp.QuestionCount != 1 {
		t.Fatalf("expected folder question count 1, got %d", folderResp.QuestionCount)
	}

	subResp := dto.ToSubjectResponse(sub, db)
	if subResp.FolderCount != 1 || subResp.QuestionCount != 1 {
		t.Fatalf("expected subject to have 1 folder and 1 question, got %+v", subResp)
	}

	subList := dto.ToSubjectListResponse([]models.Subject{sub}, db)
	if len(subList) != 1 || subList[0].FolderCount != 1 || subList[0].QuestionCount != 1 {
		t.Fatalf("unexpected subject list: %+v", subList)
	}
}
