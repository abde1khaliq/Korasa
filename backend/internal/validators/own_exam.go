package validators

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

func UserOwnExam(db *gorm.DB, examID int, userID int) (models.Exam, error) {
	var exam models.Exam
	err := db.Where("id = ? AND user_id = ?", examID, userID).First(&exam).Error
	return exam, err
}
