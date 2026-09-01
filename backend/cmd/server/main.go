package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/abde1khaliq/korasa/config"
	"github.com/abde1khaliq/korasa/internal/database"
	"github.com/abde1khaliq/korasa/internal/router"
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
)

func main() {
	config.Load()

	gin.SetMode(gin.ReleaseMode)

	if err := config.App.Validate(); err != nil {
		log.Fatalf("Configuration validation failed: %v", err)
	}

	if err := services.InitCloudinary(); err != nil {
		log.Printf("Cloudinary initialization warning: %v", err)
	}

	db, err := database.Connect()
	if err != nil {
		log.Fatalf("DB connection failed: %v", err)
	}

	r := router.SetupRouter(db)

	srv := &http.Server{
		Addr:           ":" + config.App.Port,
		Handler:        r,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   30 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	go func() {
		log.Printf("Server listening on port %s", config.App.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting gracefully")
}
