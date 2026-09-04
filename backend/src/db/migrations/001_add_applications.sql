-- Run this if you already created the DB from schema.sql before applications was added
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       TEXT NOT NULL,
  dob             DATE,
  nationality     TEXT DEFAULT 'Ugandan',
  phone           TEXT,
  email           TEXT NOT NULL,
  level           TEXT NOT NULL,
  course          TEXT NOT NULL,
  universities    TEXT[],
  o_level_url     TEXT,
  a_level_url     TEXT,
  other_docs_url  TEXT,
  status          application_status DEFAULT 'pending',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
