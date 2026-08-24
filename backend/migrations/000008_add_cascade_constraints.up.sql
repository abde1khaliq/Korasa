ALTER TABLE folders
  ADD CONSTRAINT fk_folders_subject
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

ALTER TABLE questions
  ADD CONSTRAINT fk_questions_folder
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE;