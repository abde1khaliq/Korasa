ALTER TABLE users
  ADD COLUMN has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;