package main

import (
	"github.com/abde1khaliq/korasa/config"
	"github.com/abde1khaliq/korasa/internal/database"
	"github.com/abde1khaliq/korasa/internal/router"
)

func main() {
	config.Load()

	db, err := database.Connect()
	if err != nil {
		panic("DB setup failed: " + err.Error())
	}

	r := router.SetupRouter(db)
	r.Run(":" + config.App.Port)

}
