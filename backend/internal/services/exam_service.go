package services

import (
	"errors"
	"math/rand"
	"net/http"
	"strconv"
	"strings"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var validDifficulties = map[string]bool{"easy": true, "medium": true, "hard": true}

func eligibleQuestionsQuery(db *gorm.DB, scopeType string, scopeID int, difficulties []string) *gorm.DB {
	q := db.Model(&models.Question{}).Where("difficulty IN ?", difficulties)
	if scopeType == "subject" {
		return q.Joins("JOIN folders ON folders.id = questions.folder_id").
			Where("folders.subject_id = ?", scopeID)
	}
	return q.Where("questions.folder_id = ?", scopeID)
}

func checkScopeOwnership(db *gorm.DB, scopeType string, scopeID int, userID int) error {
	if scopeType == "subject" {
		_, err := validators.UserOwnSubject(db, scopeID, userID)
		return err
	}
	_, err := validators.UserOwnFolder(db, scopeID, userID)
	return err
}

func GetEligibleQuestionCount(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		scopeType := c.Query("scope_type")
		if scopeType != "subject" && scopeType != "folder" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "scope_type must be 'subject' or 'folder'"})
			return
		}
		scopeID, err := strconv.Atoi(c.Query("scope_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scope_id"})
			return
		}
		difficulties := strings.Split(c.Query("difficulties"), ",")
		for _, d := range difficulties {
			if !validDifficulties[d] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid difficulty: " + d})
				return
			}
		}

		if err := checkScopeOwnership(db, scopeType, scopeID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "scope not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var count int64
		if err := eligibleQuestionsQuery(db, scopeType, scopeID, difficulties).Count(&count).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not count eligible questions"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"count": count})
	}
}

func CreateExam(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		var input models.ExamInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if input.Type != "full" && input.QuestionCount < 1 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "question_count is required for practice and timed exams"})
			return
		}
		if input.Type == "timed" && (input.TimeLimitMinutes == nil || *input.TimeLimitMinutes < 1) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "time_limit_minutes is required for timed exams"})
			return
		}

		if err := checkScopeOwnership(db, input.ScopeType, input.ScopeID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "scope not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		seen := map[string]bool{}
		var difficulties []string
		for _, d := range input.Difficulties {
			if !seen[d] {
				seen[d] = true
				difficulties = append(difficulties, d)
			}
		}

		var eligibleIDs []int
		if err := eligibleQuestionsQuery(db, input.ScopeType, input.ScopeID, difficulties).
			Pluck("questions.id", &eligibleIDs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not evaluate question pool"})
			return
		}
		if len(eligibleIDs) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "no questions match the selected difficulties in this scope"})
			return
		}

		questionCount := input.QuestionCount
		if input.Type == "full" {
			questionCount = len(eligibleIDs)
		} else if questionCount > len(eligibleIDs) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":     "requested question count exceeds available questions",
				"available": len(eligibleIDs),
			})
			return
		}

		rand.Shuffle(len(eligibleIDs), func(i, j int) {
			eligibleIDs[i], eligibleIDs[j] = eligibleIDs[j], eligibleIDs[i]
		})
		selected := eligibleIDs[:questionCount]

		exam := models.Exam{
			UserID:           userID,
			Name:             input.Name,
			Type:             input.Type,
			ScopeType:        input.ScopeType,
			ScopeID:          input.ScopeID,
			Difficulties:     strings.Join(difficulties, ","),
			QuestionCount:    questionCount,
			TimeLimitMinutes: input.TimeLimitMinutes,
		}

		err := db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&exam).Error; err != nil {
				return err
			}
			examQuestions := make([]models.ExamQuestion, len(selected))
			for i, qID := range selected {
				examQuestions[i] = models.ExamQuestion{ExamID: exam.ID, QuestionID: qID, Position: i}
			}
			return tx.Create(&examQuestions).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create exam"})
			return
		}

		c.JSON(http.StatusCreated, dto.ToExamResponse(exam, db))
	}
}

func ListExams(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		var exams []models.Exam
		if err := db.Where("user_id = ?", userID).Order("created_at DESC").Find(&exams).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, dto.ToExamListResponse(exams, db))
	}
}

func GetExam(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		examID, err := strconv.Atoi(c.Param("examID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exam id"})
			return
		}
		exam, err := validators.UserOwnExam(db, examID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "exam not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
		c.JSON(http.StatusOK, dto.ToExamResponse(exam, db))
	}
}

func RenameExam(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		examID, err := strconv.Atoi(c.Param("examID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exam id"})
			return
		}
		exam, err := validators.UserOwnExam(db, examID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "exam not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var input models.RenameExamInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		exam.Name = input.Name
		if err := db.Save(&exam).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not rename exam"})
			return
		}
		c.JSON(http.StatusOK, dto.ToExamResponse(exam, db))
	}
}

func DeleteExam(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		examID, err := strconv.Atoi(c.Param("examID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exam id"})
			return
		}
		exam, err := validators.UserOwnExam(db, examID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "exam not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
		// exam_questions and exam_attempts cascade at the DB level.
		// Deleting an exam wipes its attempt history — if you want history
		// to survive exam deletion, say so and I'll change the FK to not
		// cascade and orphan attempts instead.
		if err := db.Delete(&exam).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete exam"})
			return
		}
		c.Status(http.StatusNoContent)
	}
}
