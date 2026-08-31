CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  title VARCHAR(128) NOT NULL,
  description TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time VARCHAR(5) NOT NULL,
  end_time VARCHAR(5),
  location VARCHAR(255),
  color VARCHAR(32),
  reminder_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_user_id ON lessons(user_id);
CREATE INDEX idx_lessons_user_day ON lessons(user_id, day_of_week);
