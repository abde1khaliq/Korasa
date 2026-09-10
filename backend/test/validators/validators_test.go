package validators_test

import (
	"testing"
	"time"

	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/test/testutil"
	"github.com/abde1khaliq/korasa/internal/validators"
)

type sampleStruct struct {
	Name  string `validate:"required,min=3"`
	Email string `validate:"required,email"`
}

func TestValidate(t *testing.T) {
	valid := sampleStruct{Name: "Alice", Email: "alice@example.com"}
	if err := validators.Validate(valid); err != nil {
		t.Fatalf("expected valid struct, got error: %v", err)
	}

	invalid := sampleStruct{Name: "Al", Email: "not-an-email"}
	if err := validators.Validate(invalid); err == nil {
		t.Fatalf("expected validation error for invalid struct, got nil")
	}
}

func TestUserOwnSubject(t *testing.T) {
	db := testutil.SetupTestDB(t)

	// Create user1 and user2
	u1, _ := testutil.SeedUser(t, db, "user1", "u1@test.com", "user")
	u2, _ := testutil.SeedUser(t, db, "user2", "u2@test.com", "user")

	// Create subject for user1
	sub := models.Subject{UserID: u1.ID, Name: "Math"}
	db.Create(&sub)

	// user1 should own it
	found, err := validators.UserOwnSubject(db, sub.ID, u1.ID)
	if err != nil {
		t.Fatalf("expected user1 to own subject, got error: %v", err)
	}
	if found.ID != sub.ID {
		t.Fatalf("expected subject ID %d, got %d", sub.ID, found.ID)
	}

	// user2 should NOT own it
	_, err = validators.UserOwnSubject(db, sub.ID, u2.ID)
	if err == nil {
		t.Fatalf("expected error when user2 attempts to access user1's subject")
	}

	// Non-existent subject
	_, err = validators.UserOwnSubject(db, 99999, u1.ID)
	if err == nil {
		t.Fatalf("expected error for nonexistent subject")
	}
}

func TestUserOwnFolder(t *testing.T) {
	db := testutil.SetupTestDB(t)

	u1, _ := testutil.SeedUser(t, db, "user1", "u1@test.com", "user")
	u2, _ := testutil.SeedUser(t, db, "user2", "u2@test.com", "user")

	sub := models.Subject{UserID: u1.ID, Name: "Biology"}
	db.Create(&sub)

	folder := models.Folder{SubjectID: sub.ID, Name: "Genetics"}
	db.Create(&folder)

	// user1 owns folder through subject
	found, err := validators.UserOwnFolder(db, folder.ID, u1.ID)
	if err != nil {
		t.Fatalf("expected user1 to own folder, got: %v", err)
	}
	if found.ID != folder.ID {
		t.Fatalf("expected folder ID %d, got %d", folder.ID, found.ID)
	}

	// user2 does not own it
	_, err = validators.UserOwnFolder(db, folder.ID, u2.ID)
	if err == nil {
		t.Fatalf("expected error for user2 accessing user1's folder")
	}
}

func TestUserOwnQuestion(t *testing.T) {
	db := testutil.SetupTestDB(t)

	u1, _ := testutil.SeedUser(t, db, "user1", "u1@test.com", "user")
	u2, _ := testutil.SeedUser(t, db, "user2", "u2@test.com", "user")

	sub := models.Subject{UserID: u1.ID, Name: "Physics"}
	db.Create(&sub)

	folder := models.Folder{SubjectID: sub.ID, Name: "Mechanics"}
	db.Create(&folder)

	q := models.Question{
		FolderID:   folder.ID,
		ImageURL:   "https://example.com/q1.png",
		Answer:     "F = ma",
		Difficulty: "medium",
	}
	db.Create(&q)

	// user1 owns question through folder & subject
	found, err := validators.UserOwnQuestion(db, q.ID, u1.ID)
	if err != nil {
		t.Fatalf("expected user1 to own question, got: %v", err)
	}
	if found.ID != q.ID {
		t.Fatalf("expected question ID %d, got %d", q.ID, found.ID)
	}

	// user2 does not own it
	_, err = validators.UserOwnQuestion(db, q.ID, u2.ID)
	if err == nil {
		t.Fatalf("expected error for user2 accessing user1's question")
	}
}

func TestUserOwnExam(t *testing.T) {
	db := testutil.SetupTestDB(t)

	u1, _ := testutil.SeedUser(t, db, "user1", "u1@test.com", "user")
	u2, _ := testutil.SeedUser(t, db, "user2", "u2@test.com", "user")

	exam := models.Exam{
		UserID:        u1.ID,
		Name:          "Midterm Exam",
		Type:          "practice",
		ScopeType:     "subject",
		ScopeID:       1,
		Difficulties:  "easy,medium",
		QuestionCount: 5,
	}
	db.Create(&exam)

	found, err := validators.UserOwnExam(db, exam.ID, u1.ID)
	if err != nil {
		t.Fatalf("expected user1 to own exam, got: %v", err)
	}
	if found.ID != exam.ID {
		t.Fatalf("expected exam ID %d, got %d", exam.ID, found.ID)
	}

	_, err = validators.UserOwnExam(db, exam.ID, u2.ID)
	if err == nil {
		t.Fatalf("expected error for user2 accessing user1's exam")
	}
}

func TestUserOwnLesson(t *testing.T) {
	db := testutil.SetupTestDB(t)

	u1, _ := testutil.SeedUser(t, db, "user1", "u1@test.com", "user")
	u2, _ := testutil.SeedUser(t, db, "user2", "u2@test.com", "user")

	lesson := models.Lesson{
		UserID:          u1.ID,
		Title:           "Calculus Lecture",
		DayOfWeek:       1,
		StartTime:       "10:00",
		ReminderMinutes: 15,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}
	db.Create(&lesson)

	found, err := validators.UserOwnLesson(db, lesson.ID, u1.ID)
	if err != nil {
		t.Fatalf("expected user1 to own lesson, got: %v", err)
	}
	if found.ID != lesson.ID {
		t.Fatalf("expected lesson ID %d, got %d", lesson.ID, found.ID)
	}

	_, err = validators.UserOwnLesson(db, lesson.ID, u2.ID)
	if err == nil {
		t.Fatalf("expected error for user2 accessing user1's lesson")
	}
}
