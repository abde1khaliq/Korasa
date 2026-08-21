package services

import (
	"fmt"
	"html"
	"log"
	"time"

	"github.com/abde1khaliq/korasa/config"
	"github.com/resend/resend-go/v3"
)

func SendVerificationCode(to string, code string) error {
	apiKey := config.App.ResendAPIKey
	if apiKey == "" {
		return fmt.Errorf("RESEND_API_KEY not configured")
	}
	client := resend.NewClient(apiKey)

	safeTo := html.EscapeString(to)
	safeCode := html.EscapeString(code)
	year := time.Now().Year()

	htmlContent := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8" />
			<style>
				body { margin:0; padding:0; background-color:#F6F4EE; font-family:-apple-system,'Inter',Arial,sans-serif; color:#2E2A26; }
				.wrapper { max-width:480px; margin:0 auto; padding:40px 24px; }
				.brand { font-family:Georgia,'Playfair Display',serif; font-size:22px; color:#2E2A26; }
				.eyebrow { margin-top:28px; font-family:'Courier New',monospace; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#8C8477; }
				.headline { font-family:Georgia,'Playfair Display',serif; font-size:30px; line-height:1.15; margin:10px 0 0; color:#2E2A26; }
				.body-text { margin-top:12px; font-size:16px; line-height:1.6; color:#57514A; }
				.code-box { margin-top:28px; background-color:#FCFBF8; border:1px solid #E4DFD3; border-radius:18px; padding:24px; text-align:center; }
				.code { font-family:'Courier New',monospace; font-size:32px; font-weight:700; letter-spacing:0.3em; color:#2E2A26; }
				.footnote { margin-top:18px; font-size:13px; line-height:1.5; color:#8C8477; }
				.divider { margin-top:36px; border-top:1px solid #E4DFD3; }
				.legal { margin-top:18px; font-size:12px; color:#A7A093; }
			</style>
		</head>
		<body>
			<div class="wrapper">
				<div class="brand">Korasa</div>
				<p class="eyebrow">Verify your email</p>
				<h1 class="headline">Check your inbox</h1>
				<p class="body-text">Use the code below to verify %s and finish setting up your account.</p>
				<div class="code-box"><span class="code">%s</span></div>
				<p class="footnote">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
				<div class="divider"></div>
				<p class="legal">© %d Korasa. All rights reserved.</p>
			</div>
		</body>
		</html>
	`, safeTo, safeCode, year)

	params := &resend.SendEmailRequest{
		From:    "noreply@korasa.study",
		To:      []string{to},
		Subject: "Your Korasa verification code",
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
