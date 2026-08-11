package models

type Folder struct {
	ID        int    `gorm:"primaryKey"`
	Name      string `gorm:"uniqueIndex:idx_subject_folder_name;not null;size:128" validate:"required,min=1,max=128"`
	SubjectID int    `gorm:"uniqueIndex:idx_subject_folder_name;not null" validate:"required"`
}

type FolderInput struct {
	Name string `validate:"required,min=1,max=128"`
}
