package services

import (
	"fmt"
	"log"
	"os"

	"github.com/resend/resend-go/v3"
)

func SendVerificationCode(to string, code string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	client := resend.NewClient(apiKey)

	htmlContent := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; }
				.container { max-width: 600px; margin: 0 auto; padding: 20px; }
				.code { 
					font-size: 32px; 
					font-weight: bold; 
					color: #4F46E5;
					background: #F3F4F6;
					padding: 15px;
					border-radius: 8px;
					text-align: center;
					letter-spacing: 4px;
				}
				.footer { margin-top: 20px; color: #6B7280; font-size: 14px; }
			</style>
		</head>
		<body>
			<div class="container">
				<h2>Email Verification</h2>
				<p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
				<div class="code">%s</div>
				<p>This code will expire in 10 minutes.</p>
				<p>If you didn't request this, please ignore this email.</p>
				<div class="footer">
					<p>© 2026 Korasa. All rights reserved.</p>
				</div>
			</div>
		</body>
		</html>
	`, code)

	params := &resend.SendEmailRequest{
		From:    "noreply@korasa.study",
		To:      []string{to},
		Subject: "Email Verfication Code",
		Html:    htmlContent,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Printf("failed to send email: %v", err)
		return fmt.Errorf("failed to send verification email: %w", err)
	}

	log.Printf("Verification code sent to %s. Email ID: %s", to, sent.Id)
	return nil
}
