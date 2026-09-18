ALTER TABLE enquiries ADD COLUMN reference_number INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS enquiries_reference_number_idx
  ON enquiries(reference_number)
  WHERE reference_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS enquiry_reference_counter (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  next_reference INTEGER NOT NULL CHECK (next_reference BETWEEN 1000 AND 10000)
);

INSERT OR IGNORE INTO enquiry_reference_counter (singleton, next_reference)
VALUES (1, 1000);
