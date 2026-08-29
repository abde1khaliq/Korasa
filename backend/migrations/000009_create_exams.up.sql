CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(16) NOT NULL CHECK (type IN ('practice','timed','full')),
  scope_type VARCHAR(16) NOT NULL CHECK (scope_type IN ('subject','folder')),
  scope_id INTEGER NOT NULL,
  difficulties VARCHAR(32) NOT NULL,
  question_count INTEGER NOT NULL,
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exams_user_id ON exams(user_id);

CREATE TABLE exam_questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  UNIQUE (exam_id, question_id)
);