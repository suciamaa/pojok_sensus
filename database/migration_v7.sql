USE pojok_sensus;

-- Ensure questionnaire rows are uniquely tied to the respondent NIM.
-- The application also verifies respondent_id + id_key on every read/write.
-- Run this only after confirming there are no duplicate id_key values in questionnaire_responses.

-- Diagnostic query (run manually first if needed):
-- SELECT id_key, COUNT(*) AS total FROM questionnaire_responses GROUP BY id_key HAVING COUNT(*) > 1;

-- If the diagnostic returns no rows and uq_questionnaire_id_key does not exist,
-- add the unique key manually:
-- ALTER TABLE questionnaire_responses ADD UNIQUE KEY uq_questionnaire_id_key (id_key);
