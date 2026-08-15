package models

import "time"

type User struct {
	ID        int       `gorm:"primaryKey"`
	Username  string    `gorm:"unique;not null;size:32" validate:"required,min=3,max=32"`
	Email     string    `gorm:"unique;not null;size:255" validate:"required,email"`
	Password  string    `gorm:"not null" validate:"required,min=8" json:"-"`
	CreatedAt time.Time `gorm:"not null;default:now()"`
	UpdatedAt time.Time `gorm:"not null;default:now()"`
}

type RegisterInput struct {
	Username string `json:"username" validate:"required,min=3,max=32"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}
