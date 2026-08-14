package database

import (
	"fmt"

	"github.com/abde1khaliq/korasa/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
	dsn := config.App.PostgresDBUrl
	if dsn == "" {
		return nil, fmt.Errorf("PostgresDBUrl is empty — check env loading")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
