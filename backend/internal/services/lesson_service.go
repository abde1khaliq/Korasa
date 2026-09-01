package services

import (
	"errors"
	"log"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/abde1khaliq/korasa/internal/dto"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/validators"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func validateTimeFormat(t string) bool {
	if len(t) != 5 || t[2] != ':' {
		return false
	}
	_, err := time.Parse("15:04", t)
	return err == nil
}

// CreateLesson creates one or more periodic recurring lessons for the user.
func CreateLesson(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		var input models.LessonInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if !validateTimeFormat(input.StartTime) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "start_time must be in HH:mm format (e.g. 09:30)"})
			return
		}

		if input.EndTime != nil && *input.EndTime != "" {
			if !validateTimeFormat(*input.EndTime) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "end_time must be in HH:mm format (e.g. 11:00)"})
				return
			}
			if *input.EndTime <= input.StartTime {
				c.JSON(http.StatusBadRequest, gin.H{"error": "end_time must be after start_time"})
				return
			}
		}

		if input.SubjectID != nil {
			if _, err := validators.UserOwnSubject(db, *input.SubjectID, userID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
				} else {
					log.Printf("failed to verify subject ownership %d: %v", *input.SubjectID, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "could not verify subject ownership"})
				}
				return
			}
		}

		days := input.DaysOfWeek
		if len(days) == 0 && input.DayOfWeek != nil {
			days = []int{*input.DayOfWeek}
		}

		if len(days) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "at least one day_of_week is required (0=Sun..6=Sat)"})
			return
		}

		for _, d := range days {
			if d < 0 || d > 6 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "day_of_week must be between 0 (Sunday) and 6 (Saturday)"})
				return
			}
		}

		reminderMinutes := 15
		if input.ReminderMinutes != nil {
			reminderMinutes = *input.ReminderMinutes
		}

		var createdLessons []models.Lesson
		now := time.Now().UTC()

		for _, day := range days {
			lesson := models.Lesson{
				UserID:          userID,
				SubjectID:       input.SubjectID,
				Title:           input.Title,
				Description:     input.Description,
				DayOfWeek:       day,
				StartTime:       input.StartTime,
				EndTime:         input.EndTime,
				Location:        input.Location,
				Color:           input.Color,
				ReminderMinutes: reminderMinutes,
				CreatedAt:       now,
				UpdatedAt:       now,
			}

			if err := db.Create(&lesson).Error; err != nil {
				log.Printf("failed to create lesson for user %d: %v", userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create lesson"})
				return
			}

			db.Preload("Subject").First(&lesson, lesson.ID)
			createdLessons = append(createdLessons, lesson)
		}

		if len(createdLessons) == 1 {
			c.JSON(http.StatusCreated, dto.ToLessonResponse(createdLessons[0]))
		} else {
			c.JSON(http.StatusCreated, dto.ToLessonListResponse(createdLessons))
		}
	}
}

// ListLessons retrieves recurring lessons for the user with optional day_of_week & subject filters.
func ListLessons(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		query := db.Model(&models.Lesson{}).Where("user_id = ?", userID)

		if dayStr := c.Query("day_of_week"); dayStr != "" {
			if day, err := strconv.Atoi(dayStr); err == nil && day >= 0 && day <= 6 {
				query = query.Where("day_of_week = ?", day)
			}
		}

		if subjectIDStr := c.Query("subject_id"); subjectIDStr != "" {
			if subjectID, err := strconv.Atoi(subjectIDStr); err == nil {
				query = query.Where("subject_id = ?", subjectID)
			}
		}

		var lessons []models.Lesson
		if err := query.Preload("Subject").Order("day_of_week ASC, start_time ASC").Find(&lessons).Error; err != nil {
			log.Printf("failed to list lessons for user %d: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve lessons"})
			return
		}

		c.JSON(http.StatusOK, dto.ToLessonListResponse(lessons))
	}
}

type upcomingLessonCandidate struct {
	lesson     models.Lesson
	daysOffset int
}

// GetUpcomingLessons returns the next scheduled recurring lessons ordered chronologically.
func GetUpcomingLessons(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")

		limit := 10
		if limitStr := c.Query("limit"); limitStr != "" {
			if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
				limit = l
			}
		}

		var allLessons []models.Lesson
		if err := db.Model(&models.Lesson{}).
			Where("user_id = ?", userID).
			Preload("Subject").
			Find(&allLessons).Error; err != nil {
			log.Printf("failed to retrieve upcoming lessons for user %d: %v", userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve upcoming lessons"})
			return
		}

		if len(allLessons) == 0 {
			c.JSON(http.StatusOK, []dto.LessonResponse{})
			return
		}

		now := time.Now()
		currentWeekday := int(now.Weekday()) // 0=Sunday..6=Saturday
		currentTimeStr := now.Format("15:04")

		candidates := make([]upcomingLessonCandidate, 0, len(allLessons))

		for _, l := range allLessons {
			var daysOffset int
			if l.DayOfWeek == currentWeekday {
				if l.StartTime >= currentTimeStr {
					daysOffset = 0 // Later today
				} else {
					daysOffset = 7 // Same day next week
				}
			} else if l.DayOfWeek > currentWeekday {
				daysOffset = l.DayOfWeek - currentWeekday
			} else {
				daysOffset = 7 - (currentWeekday - l.DayOfWeek)
			}

			candidates = append(candidates, upcomingLessonCandidate{
				lesson:     l,
				daysOffset: daysOffset,
			})
		}

		// Sort by daysOffset ASC, then StartTime ASC
		sort.Slice(candidates, func(i, j int) bool {
			if candidates[i].daysOffset != candidates[j].daysOffset {
				return candidates[i].daysOffset < candidates[j].daysOffset
			}
			return candidates[i].lesson.StartTime < candidates[j].lesson.StartTime
		})

		if len(candidates) > limit {
			candidates = candidates[:limit]
		}

		result := make([]models.Lesson, len(candidates))
		for i, c := range candidates {
			result[i] = c.lesson
		}

		c.JSON(http.StatusOK, dto.ToLessonListResponse(result))
	}
}

// GetLesson returns a single lesson by ID for the authenticated user.
func GetLesson(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		lessonID, err := strconv.Atoi(c.Param("lessonID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid lesson ID"})
			return
		}

		lesson, err := validators.UserOwnLesson(db, lessonID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "lesson not found"})
			} else {
				log.Printf("failed to retrieve lesson %d for user %d: %v", lessonID, userID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not retrieve lesson"})
			}
			return
		}

		c.JSON(http.StatusOK, dto.ToLessonResponse(lesson))
	}
}

// UpdateLesson updates an existing periodic lesson for the user.
func UpdateLesson(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		lessonID, err := strconv.Atoi(c.Param("lessonID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid lesson ID"})
			return
		}

		lesson, err := validators.UserOwnLesson(db, lessonID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "lesson not found"})
			} else {
				log.Printf("failed to verify lesson ownership %d: %v", lessonID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update lesson"})
			}
			return
		}

		var input models.LessonInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := validators.Validate(input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if !validateTimeFormat(input.StartTime) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "start_time must be in HH:mm format"})
			return
		}

		if input.EndTime != nil && *input.EndTime != "" {
			if !validateTimeFormat(*input.EndTime) {
				c.JSON(http.StatusBadRequest, gin.H{"error": "end_time must be in HH:mm format"})
				return
			}
			if *input.EndTime <= input.StartTime {
				c.JSON(http.StatusBadRequest, gin.H{"error": "end_time must be after start_time"})
				return
			}
		}

		if input.SubjectID != nil {
			if _, err := validators.UserOwnSubject(db, *input.SubjectID, userID); err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					c.JSON(http.StatusNotFound, gin.H{"error": "subject not found"})
				} else {
					log.Printf("failed to verify subject ownership %d: %v", *input.SubjectID, err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update lesson"})
				}
				return
			}
		}

		if input.DayOfWeek != nil {
			if *input.DayOfWeek < 0 || *input.DayOfWeek > 6 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "day_of_week must be between 0 (Sunday) and 6 (Saturday)"})
				return
			}
			lesson.DayOfWeek = *input.DayOfWeek
		}

		reminderMinutes := lesson.ReminderMinutes
		if input.ReminderMinutes != nil {
			reminderMinutes = *input.ReminderMinutes
		}

		lesson.SubjectID = input.SubjectID
		lesson.Title = input.Title
		lesson.Description = input.Description
		lesson.StartTime = input.StartTime
		lesson.EndTime = input.EndTime
		lesson.Location = input.Location
		lesson.Color = input.Color
		lesson.ReminderMinutes = reminderMinutes
		lesson.UpdatedAt = time.Now().UTC()

		if err := db.Save(&lesson).Error; err != nil {
			log.Printf("failed to save lesson %d: %v", lessonID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update lesson"})
			return
		}

		if err := db.Preload("Subject").First(&lesson, lesson.ID).Error; err != nil {
			log.Printf("failed to load updated lesson %d: %v", lessonID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load updated lesson"})
			return
		}

		c.JSON(http.StatusOK, dto.ToLessonResponse(lesson))
	}
}

// DeleteLesson removes a periodic lesson.
func DeleteLesson(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetInt("userID")
		lessonID, err := strconv.Atoi(c.Param("lessonID"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid lesson ID"})
			return
		}

		lesson, err := validators.UserOwnLesson(db, lessonID, userID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "lesson not found"})
			} else {
				log.Printf("failed to verify lesson ownership %d: %v", lessonID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete lesson"})
			}
			return
		}

		if err := db.Delete(&lesson).Error; err != nil {
			log.Printf("failed to delete lesson %d: %v", lessonID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete lesson"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "lesson deleted successfully"})
	}
}
