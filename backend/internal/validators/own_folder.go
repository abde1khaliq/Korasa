package validators

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

// UserOwnFolder verifies at the query level that the folder belongs to a subject owned by the user.
func UserOwnFolder(db *gorm.DB, folderID, userID int) (models.Folder, error) {
	var folder models.Folder
	err := db.Joins("JOIN subjects ON subjects.id = folders.subject_id").
		Where("folders.id = ? AND subjects.user_id = ?", folderID, userID).
		First(&folder).Error
	return folder, err
}
