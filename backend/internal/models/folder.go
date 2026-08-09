package models

type Folder struct {
	ID        int `gorm:"primaryKey"`
	Name      string
	SubjectID int
}
