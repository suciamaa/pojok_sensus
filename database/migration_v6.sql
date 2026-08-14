USE pojok_sensus;

ALTER TABLE questionnaire_responses
MODIFY COLUMN status ENUM('draft','submitted','failed') NOT NULL DEFAULT 'draft';

-- Safe to run once. Existing submitted/failed rows remain unchanged.
