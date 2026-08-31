package validators

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

// UserOwnLesson verifies that the lesson with the given ID belongs to the user.
func UserOwnLesson(db *gorm.DB, lessonID int, userID int) (models.Lesson, error) {
	var lesson models.Lesson
	err := db.Preload("Subject").Where("id = ? AND user_id = ?", lessonID, userID).First(&lesson).Error
	return lesson, err
}
