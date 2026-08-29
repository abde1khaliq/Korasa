CREATE TABLE exam_attempts (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_count INTEGER NOT NULL,
  duration_secs INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exam_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_user_id ON exam_attempts(user_id);

-- question_id has NO foreign key on purpose: this table is a historical
-- record. A later question deletion (which cascades from folders) must
-- not be able to delete past exam results or corrupt score totals.
-- Trade-off: reviewing a very old attempt can't show image/answer for a
-- question that's since been deleted.
CREATE TABLE exam_attempt_answers (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  position INTEGER NOT NULL
);

CREATE INDEX idx_exam_attempt_answers_attempt_id ON exam_attempt_answers(attempt_id);