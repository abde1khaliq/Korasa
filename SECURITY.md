# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security of Korasa seriously. If you discover a security vulnerability, please **do not open a public GitHub issue**.

Instead, follow responsible disclosure:

1. **Email us privately**: Send details to [support@korasa.study](mailto:support@korasa.study).
2. **Include details**:
   - Description of the vulnerability and its potential impact.
   - Step-by-step reproduction steps or a minimal proof of concept (PoC).
   - Any suggested remediations or patches.
3. **Response timeline**:
   - You will receive an acknowledgment within **48 hours**.
   - We will provide a timeline for investigation and remediation.
   - We will coordinate public release after a patch is deployed.

---

## Security Best Practices for Self-Hosting

When self-hosting Korasa in production:
- Use strong, randomly generated secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` (at least 32 random characters/bytes).
- Always use HTTPS / TLS in production and set proper `CORS_ALLOWED_ORIGINS`.
- Keep PostgreSQL database credentials secure and never commit `.env` files into source control.
