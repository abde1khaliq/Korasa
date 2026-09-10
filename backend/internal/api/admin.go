package api

import (
	"github.com/abde1khaliq/korasa/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func AdminRoutes(router *gin.RouterGroup, db *gorm.DB) {
	router.GET("/stats", services.GetAdminStats(db))
	router.GET("/tables", services.ListAdminTables(db))
	router.GET("/tables/:table/schema", services.GetTableSchema(db))
	router.GET("/tables/:table", services.GetTableRows(db))
	router.POST("/tables/:table", services.CreateTableRow(db))
	router.PUT("/tables/:table/:id", services.UpdateTableRow(db))
	router.DELETE("/tables/:table/:id", services.DeleteTableRow(db))
}
