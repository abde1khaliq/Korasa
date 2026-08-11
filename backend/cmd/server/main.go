package main

import (
	"fmt"

	"github.com/abde1khaliq/korasa/internal/database"
	"github.com/abde1khaliq/korasa/internal/models"
	"github.com/abde1khaliq/korasa/internal/router"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		panic("DB setup failed: " + err.Error())
	}

	fmt.Println("Database connected successfully!")

	db.AutoMigrate(&models.User{}, &models.Subject{})

	r := router.SetupRouter(db)
	r.Run(":8080")

}
