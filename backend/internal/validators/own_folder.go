package validators

import (
	"github.com/abde1khaliq/korasa/internal/models"
	"gorm.io/gorm"
)

func UserOwnFolder(db *gorm.DB, folderID, userID int) (models.Folder, error) {
	var folder models.Folder
	if err := db.First(&folder, folderID).Error; err != nil {
		return folder, err
	}
	if _, err := UserOwnSubject(db, folder.SubjectID, userID); err != nil {
		return folder, err
	}
	return folder, nil
}
