package services

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/abde1khaliq/korasa/internal/security"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Allowed public tables to safeguard against arbitrary table access
var systemExcludedTables = map[string]bool{
	"schema_migrations": true,
}

func isTableAllowed(db *gorm.DB, tableName string) bool {
	if systemExcludedTables[tableName] {
		return false
	}
	return db.Migrator().HasTable(tableName)
}

type ColumnDefinition struct {
	ColumnName    string  `json:"column_name"`
	DataType      string  `json:"data_type"`
	IsNullable    string  `json:"is_nullable"`
	ColumnDefault *string `json:"column_default"`
}

type TableSummary struct {
	Name     string `json:"name"`
	RowCount int64  `json:"row_count"`
}

// GetAdminStats returns global analytics: DAU, MAU, total users, table counts, and recent logins
func GetAdminStats(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var totalUsers int64
		var dau int64
		var mau int64

		if err := db.Table("users").Count(&totalUsers).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count users"})
			return
		}

		// DAU: active in the last 24 hours
		dayAgo := time.Now().Add(-24 * time.Hour)
		_ = db.Table("users").Where("last_active_at >= ?", dayAgo).Count(&dau).Error

		// MAU: active in the last 30 days
		monthAgo := time.Now().Add(-30 * 24 * time.Hour)
		_ = db.Table("users").Where("last_active_at >= ?", monthAgo).Count(&mau).Error

		// Recent active users
		var recentUsers []struct {
			ID           int        `json:"id"`
			Username     string     `json:"username"`
			Email        string     `json:"email"`
			Role         string     `json:"role"`
			LastActiveAt *time.Time `json:"last_active_at"`
			CreatedAt    time.Time  `json:"created_at"`
		}
		_ = db.Table("users").
			Select("id, username, email, role, last_active_at, created_at").
			Order("last_active_at DESC").
			Limit(10).
			Scan(&recentUsers).Error

		// Active users breakdown over the last 14 days
		type DailyStat struct {
			Date  string `json:"date"`
			Count int64  `json:"count"`
		}
		var dailyStats []DailyStat
		fourteenDaysAgo := time.Now().Add(-14 * 24 * time.Hour)

		if db.Dialector.Name() == "sqlite" {
			_ = db.Raw(`
				SELECT strftime('%Y-%m-%d', last_active_at) AS date, count(*) AS count
				FROM users
				WHERE last_active_at >= ?
				GROUP BY strftime('%Y-%m-%d', last_active_at)
				ORDER BY date ASC
			`, fourteenDaysAgo).Scan(&dailyStats).Error
		} else {
			_ = db.Raw(`
				SELECT to_char(date_trunc('day', last_active_at), 'YYYY-MM-DD') AS date, count(*) AS count
				FROM users
				WHERE last_active_at >= ?
				GROUP BY date_trunc('day', last_active_at)
				ORDER BY date_trunc('day', last_active_at) ASC
			`, fourteenDaysAgo).Scan(&dailyStats).Error
		}

		// Summary counts for key entities
		counts := make(map[string]int64)
		for _, tbl := range []string{"subjects", "folders", "questions", "exams", "lessons", "exam_attempts"} {
			var cnt int64
			if db.Migrator().HasTable(tbl) {
				_ = db.Table(tbl).Count(&cnt).Error
			}
			counts[tbl] = cnt
		}

		c.JSON(http.StatusOK, gin.H{
			"total_users":  totalUsers,
			"dau":          dau,
			"mau":          mau,
			"recent_users": recentUsers,
			"daily_stats":  dailyStats,
			"counts":       counts,
		})
	}
}

// ListAdminTables lists all user-accessible database tables
func ListAdminTables(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tableNames, err := db.Migrator().GetTables()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list tables"})
			return
		}

		summaries := make([]TableSummary, 0, len(tableNames))
		for _, name := range tableNames {
			if systemExcludedTables[name] {
				continue
			}
			var cnt int64
			_ = db.Table(name).Count(&cnt).Error
			summaries = append(summaries, TableSummary{
				Name:     name,
				RowCount: cnt,
			})
		}

		c.JSON(http.StatusOK, gin.H{"tables": summaries})
	}
}

// GetTableSchema returns columns and their types for a given table
func GetTableSchema(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table")
		if !isTableAllowed(db, tableName) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table name"})
			return
		}

		colTypes, err := db.Migrator().ColumnTypes(tableName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to retrieve schema"})
			return
		}

		columns := make([]ColumnDefinition, 0, len(colTypes))
		for _, col := range colTypes {
			isNullable := "NO"
			if nullable, ok := col.Nullable(); ok && nullable {
				isNullable = "YES"
			}
			var defVal *string
			if val, ok := col.DefaultValue(); ok {
				defVal = &val
			}

			columns = append(columns, ColumnDefinition{
				ColumnName:    col.Name(),
				DataType:      col.DatabaseTypeName(),
				IsNullable:    isNullable,
				ColumnDefault: defVal,
			})
		}

		c.JSON(http.StatusOK, gin.H{"table": tableName, "columns": columns})
	}
}

// GetTableRows returns paginated rows of a table
func GetTableRows(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table")
		if !isTableAllowed(db, tableName) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table name"})
			return
		}

		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		if page < 1 {
			page = 1
		}
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
		if limit < 1 || limit > 200 {
			limit = 50
		}
		offset := (page - 1) * limit

		var total int64
		if err := db.Table(tableName).Count(&total).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to count rows"})
			return
		}

		var rows []map[string]interface{}
		query := db.Table(tableName).Limit(limit).Offset(offset)

		// If table has 'id' column, sort by id desc
		if db.Migrator().HasColumn(tableName, "id") {
			query = query.Order("id DESC")
		}

		if err := query.Find(&rows).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch rows"})
			return
		}

		// Omit password hash when viewing users table
		if tableName == "users" {
			for i := range rows {
				delete(rows[i], "password")
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"table": tableName,
			"page":  page,
			"limit": limit,
			"total": total,
			"data":  rows,
		})
	}
}

// CreateTableRow creates a new row in the specified table
func CreateTableRow(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table")
		if !isTableAllowed(db, tableName) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table name"})
			return
		}

		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json payload"})
			return
		}

		// Prevent setting primary key manually if empty or 0
		delete(payload, "id")

		// Special handling for users
		if tableName == "users" {
			pwd, ok := payload["password"].(string)
			if !ok || len(strings.TrimSpace(pwd)) < 8 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
				return
			}
			hashed, err := security.HashPassword(pwd)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
				return
			}
			payload["password"] = hashed

			if _, ok := payload["role"]; !ok || payload["role"] == "" {
				payload["role"] = "user"
			}
		}

		if err := db.Table(tableName).Create(&payload).Error; err != nil {
			log.Printf("error inserting into %s: %v", tableName, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to create row: %v", err)})
			return
		}

		delete(payload, "password")
		c.JSON(http.StatusCreated, gin.H{"status": "created", "data": payload})
	}
}

// UpdateTableRow updates an existing row by ID
func UpdateTableRow(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table")
		id := c.Param("id")
		if !isTableAllowed(db, tableName) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table name"})
			return
		}

		var payload map[string]interface{}
		if err := c.ShouldBindJSON(&payload); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json payload"})
			return
		}

		// Don't allow changing primary key
		delete(payload, "id")

		// Special handling for users password
		if tableName == "users" {
			if pwd, ok := payload["password"].(string); ok && strings.TrimSpace(pwd) != "" {
				if len(pwd) < 8 {
					c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
					return
				}
				hashed, err := security.HashPassword(pwd)
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
					return
				}
				payload["password"] = hashed
			} else {
				delete(payload, "password")
			}
		}

		res := db.Table(tableName).Where("id = ?", id).Updates(payload)
		if res.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
			return
		}
		if res.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "record not found"})
			return
		}

		delete(payload, "password")
		c.JSON(http.StatusOK, gin.H{"status": "updated", "id": id, "data": payload})
	}
}

// DeleteTableRow deletes an existing row by ID
func DeleteTableRow(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		tableName := c.Param("table")
		id := c.Param("id")
		if !isTableAllowed(db, tableName) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table name"})
			return
		}

		res := db.Table(tableName).Where("id = ?", id).Delete(nil)
		if res.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
			return
		}
		if res.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "record not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": "deleted", "id": id})
	}
}
