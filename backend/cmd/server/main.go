package main

import (
	"github.com/abde1khaliq/korasa/config"
	"github.com/abde1khaliq/korasa/internal/database"
	"github.com/abde1khaliq/korasa/internal/router"
	"github.com/abde1khaliq/korasa/internal/services"
)

func main() {
	config.Load()

	if err := services.InitCloudinary(); err != nil {
		panic("Cloudinary setup failed: " + err.Error())
	}

	db, err := database.Connect()
	if err != nil {
		panic("DB setup failed: " + err.Error())
	}

	r := router.SetupRouter(db)
	r.Run(":" + config.App.Port)

}
