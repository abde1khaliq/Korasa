package database

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
	dsn := "postgresql://postgres.cwrqolotwbylpeltyvvh:yAUXYTlSsg06xKXV@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
	if dsn == "" {
		return nil, fmt.Errorf("PostgresDBUrl is empty — check env loading")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
