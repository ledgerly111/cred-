CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  profile TEXT NOT NULL,
  interest TEXT NOT NULL DEFAULT '',
  goals TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'website-contact',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  email_status TEXT NOT NULL DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  created_at TEXT NOT NULL,
  updated_at TEXT,
  emailed_at TEXT
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries(status, created_at DESC);

CREATE TABLE IF NOT EXISTS enquiry_rate_limits (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS enquiry_rate_limits_lookup_idx ON enquiry_rate_limits(ip_hash, created_at);

CREATE TABLE IF NOT EXISTS dashboard_login_attempts (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS dashboard_login_attempts_lookup_idx ON dashboard_login_attempts(ip_hash, created_at);
