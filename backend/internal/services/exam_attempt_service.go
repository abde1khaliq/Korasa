package services

import (
	"errors"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func StartAttempt(db *gorm.DB) gin.HandlerFunc {
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

		// Reads the CURRENT exam_questions rows, not exam.QuestionCount —
		// a question in the locked set may have been deleted since
		// creation (exam_questions.question_id cascades), which would
		// silently shrink the set below what was originally promised.
		type row struct {
			QuestionID int
			ImageURL   string
			Text       string
			Answer     string
			Difficulty string
			Note       string
		}
		var rows []row
		if err := db.Table("exam_questions").
			Select("questions.id as question_id, questions.image_url, questions.text, questions.answer, questions.difficulty, questions.note").
			Joins("JOIN questions ON questions.id = exam_questions.question_id").
			Where("exam_questions.exam_id = ?", exam.ID).
			Scan(&rows).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load exam questions"})
			return
		}

		if len(rows) == 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "this exam has no remaining questions — the source questions may have been deleted"})
			return
		}

		// SET stays locked; only the order the user sees them in shuffles
		// per attempt.
		rand.Shuffle(len(rows), func(i, j int) { rows[i], rows[j] = rows[j], rows[i] })

		questions := make([]dto.AttemptQuestionResponse, len(rows))
		for i, r := range rows {
			questions[i] = dto.AttemptQuestionResponse{
				QuestionID: r.QuestionID,
				ImageURL:   r.ImageURL,
				Text:       r.Text,
				Answer:     r.Answer,
				Difficulty: r.Difficulty,
				Note:       r.Note,
			}
		}

		attempt := models.ExamAttempt{
			ExamID:     exam.ID,
			UserID:     userID,
			StartedAt:  time.Now(),
			TotalCount: len(rows),
		}
		if err := db.Create(&attempt).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not start attempt"})
			return
		}

		c.JSON(http.StatusCreated, dto.StartAttemptResponse{
			AttemptID:        attempt.ID,
			ExamID:           exam.ID,
			StartedAt:        attempt.StartedAt,
			TimeLimitMinutes: exam.TimeLimitMinutes,
			Questions:        questions,
		})
	}
}

// CompleteAttempt requires the client to submit a result for every
// question that was served. There's currently no "abandoned attempt"
// handling — if the user quits mid-exam, the attempt row stays
// incomplete (completed_at null) forever and shows as such in history.
// Say if you want a timeout/expiry sweep for those.
func CompleteAttempt(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		examID, err := strconv.Atoi(c.Param("examID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exam id"})
			return
		}
		attemptID, err := strconv.Atoi(c.Param("attemptID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid attempt id"})
			return
		}

		if _, err := validators.UserOwnExam(db, examID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "exam not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var attempt models.ExamAttempt
		if err := db.Where("id = ? AND exam_id = ? AND user_id = ?", attemptID, examID, userID).
			First(&attempt).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "attempt not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}
		if attempt.CompletedAt != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "attempt already completed"})
			return
		}

		var input models.SubmitAttemptInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if len(input.Answers) != attempt.TotalCount {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":    "answers must cover every question in the attempt",
				"expected": attempt.TotalCount,
				"got":      len(input.Answers),
			})
			return
		}

		now := time.Now()
		duration := int(now.Sub(attempt.StartedAt).Seconds())
		correctCount := 0
		answers := make([]models.ExamAttemptAnswer, len(input.Answers))
		for i, a := range input.Answers {
			if a.IsCorrect {
				correctCount++
			}
			answers[i] = models.ExamAttemptAnswer{
				AttemptID:  attempt.ID,
				QuestionID: a.QuestionID,
				IsCorrect:  a.IsCorrect,
				Position:   i,
			}
		}

		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&answers).Error; err != nil {
				return err
			}
			attempt.CompletedAt = &now
			attempt.CorrectCount = correctCount
			attempt.DurationSecs = &duration
			return tx.Save(&attempt).Error
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not complete attempt"})
			return
		}

		c.JSON(http.StatusOK, dto.ToAttemptResponse(attempt))
	}
}

func ListAttempts(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		examID, err := strconv.Atoi(c.Param("examID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exam id"})
			return
		}
		if _, err := validators.UserOwnExam(db, examID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "exam not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var attempts []models.ExamAttempt
		if err := db.Where("exam_id = ?", examID).Order("started_at DESC").Find(&attempts).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, dto.ToAttemptListResponse(attempts))
	}
}

func GetAttempt(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		examID, err := strconv.Atoi(c.Param("examID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid exam id"})
			return
		}
		attemptID, err := strconv.Atoi(c.Param("attemptID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid attempt id"})
			return
		}
		if _, err := validators.UserOwnExam(db, examID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "exam not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		var attempt models.ExamAttempt
		if err := db.Where("id = ? AND exam_id = ?", attemptID, examID).First(&attempt).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "attempt not found"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		c.JSON(http.StatusOK, dto.ToAttemptResponse(attempt))
	}
}
