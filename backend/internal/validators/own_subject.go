package validators

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

func UserOwnSubject(db *gorm.DB, subjectID int, userID int) (models.Subject, error) {
	var subject models.Subject
	err := db.Where("id = ? AND user_id = ?", subjectID, userID).First(&subject).Error
	return subject, err
}
