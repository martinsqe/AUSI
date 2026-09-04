-- ============================================================
-- AUSI Platform Database Schema
-- PostgreSQL 18
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE member_role AS ENUM (
  'student', 'alumni', 'exec', 'chapter_president', 'patron', 'admin', 'university_rep'
);

CREATE TYPE event_type AS ENUM (
  'national', 'chapter', 'workshop', 'cultural', 'academic', 'virtual'
);

CREATE TYPE opp_type AS ENUM (
  'scholarship', 'internship', 'job', 'research'
);

CREATE TYPE resource_category AS ENUM (
  'student_guide', 'visa_frro', 'housing', 'finance', 'faq', 'emergency'
);

-- ============================================================
-- UNIVERSITIES
-- ============================================================
CREATE TABLE universities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  chapter     TEXT NOT NULL,         -- e.g. "Bengaluru"
  member_count INT DEFAULT 0,
  fields      TEXT[],                -- e.g. ARRAY['Engineering','Medicine']
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- MEMBERS (users)
-- ============================================================
CREATE TABLE members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           CITEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            member_role DEFAULT 'student',
  university_id   UUID REFERENCES universities(id),
  university_name TEXT,                          -- text fallback when university_id is null
  year_of_study   INT,
  field_of_study  TEXT,
  phone           TEXT,
  arrival_date    DATE,
  avatar_url      TEXT,
  bio             TEXT,
  is_verified     BOOLEAN DEFAULT false,
  joined_at       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LEADERSHIP
-- ============================================================
CREATE TABLE leadership (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID REFERENCES members(id),
  position     TEXT NOT NULL,        -- e.g. "National President"
  scope        TEXT NOT NULL,        -- "national" | "chapter:<city>"
  term_start   DATE NOT NULL,
  term_end     DATE,
  email        TEXT,
  phone        TEXT,
  responsibilities TEXT,
  is_current   BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  type          event_type DEFAULT 'chapter',
  location_name TEXT,
  location_city TEXT,
  state         TEXT,
  university_id UUID REFERENCES universities(id),
  event_date    DATE NOT NULL,
  end_date      DATE,
  capacity      INT,
  cost_inr      INT DEFAULT 0,       -- 0 = free
  image_url     TEXT,
  is_featured   BOOLEAN DEFAULT false,
  is_published  BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE event_registrations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id   UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id  UUID REFERENCES members(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, member_id)
);

-- ============================================================
-- OPPORTUNITIES
-- ============================================================
CREATE TABLE opportunities (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  organisation TEXT NOT NULL,
  type         opp_type DEFAULT 'internship',
  location     TEXT,
  state        TEXT,
  compensation TEXT,
  duration     TEXT,
  eligibility  TEXT,
  deadline     DATE,
  apply_url    TEXT,
  is_open      BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RESOURCES
-- ============================================================
CREATE TABLE resources (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  category    resource_category DEFAULT 'student_guide',
  file_url    TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

CREATE TABLE applications (
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

-- ============================================================
-- JOIN REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS join_requests (
  id              SERIAL PRIMARY KEY,
  full_name       VARCHAR(255) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(50),
  university_id   UUID,
  university_name VARCHAR(255),
  field_of_study  VARCHAR(255),
  message         TEXT,
  status          VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PASSWORD RESETS (OTP)
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  email      VARCHAR(255) PRIMARY KEY,
  otp_hash   VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ  NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT now()
);

-- ============================================================
-- SEED: Universities
-- ============================================================
INSERT INTO universities (name, city, state, chapter, member_count, fields) VALUES
-- Karnataka
('Manipal Academy of Higher Education', 'Bengaluru', 'Karnataka', 'Bengaluru', 110, ARRAY['Engineering','Medicine','Law']),
('REVA University',                     'Bengaluru', 'Karnataka', 'Bengaluru',  92, ARRAY['Engineering','Management']),
('Christ University',                   'Bengaluru', 'Karnataka', 'Bengaluru',  68, ARRAY['Arts','Commerce','Science']),
('Bangalore Medical College',           'Bengaluru', 'Karnataka', 'Bengaluru',  31, ARRAY['Medicine']),
('PES University',                      'Bengaluru', 'Karnataka', 'Bengaluru',  19, ARRAY['Engineering']),
-- Maharashtra
('Symbiosis International University',      'Pune', 'Maharashtra', 'Pune', 128, ARRAY['Business','IT','Law','Design']),
('DY Patil University',                     'Pune', 'Maharashtra', 'Pune',  86, ARRAY['Medicine','Engineering']),
('Bharati Vidyapeeth Deemed University',    'Pune', 'Maharashtra', 'Pune',  62, ARRAY['Law','Sciences','Engineering']),
('Saveetha Dental College',                 'Pune', 'Maharashtra', 'Pune',  34, ARRAY['Dentistry','Health Sciences']),
-- Telangana
('Osmania University',                 'Hyderabad', 'Telangana', 'Hyderabad', 102, ARRAY['Sciences','Arts','Engineering']),
('University of Hyderabad',            'Hyderabad', 'Telangana', 'Hyderabad',  89, ARRAY['Sciences','Humanities']),
('BITS Pilani – Hyderabad Campus',     'Hyderabad', 'Telangana', 'Hyderabad',  56, ARRAY['Engineering','Sciences']),
('Nizam''s Institute of Medical Sciences','Hyderabad','Telangana','Hyderabad', 38, ARRAY['Medicine','Surgery']),
-- Andhra Pradesh
('Andhra University',        'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam',  84, ARRAY['Engineering','Sciences','Law']),
('GITAM University',         'Visakhapatnam', 'Andhra Pradesh', 'Visakhapatnam',  62, ARRAY['Engineering','Management']),
('Vignan''s Foundation for Science','Visakhapatnam','Andhra Pradesh','Visakhapatnam',37, ARRAY['Technology','Sciences']),
-- NCT Delhi
('AIIMS New Delhi',       'New Delhi', 'NCT Delhi',       'Delhi',  68, ARRAY['Medicine','Nursing','Research']),
('Jamia Millia Islamia',  'New Delhi', 'NCT Delhi',       'Delhi',  44, ARRAY['Engineering','Arts','Social Sciences']),
('Amity University, Noida','Noida',    'Uttar Pradesh',   'Delhi',  30, ARRAY['Business','Engineering']);
