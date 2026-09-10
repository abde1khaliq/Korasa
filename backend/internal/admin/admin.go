package admin

import (
	_ "embed"
	"net/http"

	"github.com/gin-gonic/gin"
)

//go:embed dashboard.html
var DashboardHTML []byte

// DashboardHandler serves the embedded admin single-page dashboard
func DashboardHandler(c *gin.Context) {
	c.Data(http.StatusOK, "text/html; charset=utf-8", DashboardHTML)
}
