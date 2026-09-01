package validators

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

// UserOwnQuestion verifies at the query level that the question belongs to a folder and subject owned by the user.
func UserOwnQuestion(db *gorm.DB, questionID, userID int) (models.Question, error) {
	var question models.Question
	err := db.Joins("JOIN folders ON folders.id = questions.folder_id").
		Joins("JOIN subjects ON subjects.id = folders.subject_id").
		Where("questions.id = ? AND subjects.user_id = ?", questionID, userID).
		First(&question).Error
	return question, err
}
