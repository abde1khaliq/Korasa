package services

import (
	"errors"
	"log"
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
				log.Printf("failed to retrieve exam %d for user %d: %v", examID, userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not verify exam ownership"})
			}
			return
		}

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
			log.Printf("failed to load exam questions for exam %d: %v", exam.ID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load exam questions"})
			return
		}

		if len(rows) == 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "this exam has no remaining questions — the source questions may have been deleted"})
			return
		}

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
			log.Printf("failed to create exam attempt for exam %d: %v", exam.ID, err)
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
				log.Printf("failed to verify exam %d for user %d: %v", examID, userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not verify exam ownership"})
			}
			return
		}

		var attempt models.ExamAttempt
		if err := db.Where("id = ? AND exam_id = ? AND user_id = ?", attemptID, examID, userID).
			First(&attempt).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "attempt not found"})
			} else {
				log.Printf("failed to retrieve attempt %d: %v", attemptID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve attempt"})
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
			log.Printf("failed to complete attempt transaction %d: %v", attempt.ID, err)
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
				log.Printf("failed to verify exam %d for user %d: %v", examID, userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve attempts"})
			}
			return
		}

		var attempts []models.ExamAttempt
		if err := db.Where("exam_id = ? AND user_id = ?", examID, userID).Order("started_at DESC").Find(&attempts).Error; err != nil {
			log.Printf("failed to list attempts for exam %d: %v", examID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve attempts"})
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
				log.Printf("failed to verify exam %d for user %d: %v", examID, userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve attempt"})
			}
			return
		}

		var attempt models.ExamAttempt
		if err := db.Where("id = ? AND exam_id = ? AND user_id = ?", attemptID, examID, userID).First(&attempt).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "attempt not found"})
			} else {
				log.Printf("failed to retrieve attempt %d: %v", attemptID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve attempt"})
			}
			return
		}

		c.JSON(http.StatusOK, dto.ToAttemptResponse(attempt))
	}
}
