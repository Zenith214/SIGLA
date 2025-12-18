-- Create all tables for SIGLA Survey System
-- Run this in Supabase SQL Editor

-- Create enums first
CREATE TYPE barangay_seal AS ENUM ('yes', 'no');
CREATE TYPE survey_status AS ENUM ('draft', 'ongoing', 'completed', 'archived');
CREATE TYPE survey_cycle_status AS ENUM ('Active', 'Completed', 'Archived');
CREATE TYPE assignment_status AS ENUM ('Active', 'Pending', 'Completed');
CREATE TYPE backup_status AS ENUM ('Success', 'Failed');
CREATE TYPE survey_question_question_type AS ENUM ('radio', 'checkbox', 'text', 'textarea', 'number', 'rating');
CREATE TYPE survey_section_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE survey_response_respondent_gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE survey_response_status AS ENUM ('draft', 'in_progress', 'completed', 'submitted');
CREATE TYPE survey_validation_validation_type AS ENUM ('location', 'completeness', 'consistency', 'quality');
CREATE TYPE survey_validation_validation_status AS ENUM ('passed', 'failed', 'warning');

-- Create tables
CREATE TABLE barangay (
    barangay_id SERIAL PRIMARY KEY,
    barangay_name TEXT UNIQUE NOT NULL,
    seal barangay_seal DEFAULT 'no',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    households INTEGER DEFAULT 0,
    population INTEGER DEFAULT 0,
    area DECIMAL,
    captain TEXT,
    currentStatus TEXT,
    history TEXT
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "firstName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "lastName" TEXT NOT NULL,
    organization TEXT,
    phone TEXT,
    "lastLogin" TIMESTAMP,
    role TEXT DEFAULT 'Viewer',
    status TEXT DEFAULT 'Active'
);

CREATE TABLE assignment (
    assignment_id SERIAL PRIMARY KEY,
    barangay_id INTEGER REFERENCES barangay(barangay_id),
    user_id INTEGER REFERENCES "user"(id),
    status assignment_status DEFAULT 'Pending',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE survey_target (
    target_id SERIAL PRIMARY KEY,
    barangay_id INTEGER REFERENCES barangay(barangay_id),
    target INTEGER NOT NULL,
    achieved INTEGER DEFAULT 0,
    percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE backup (
    backup_id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    time TIMESTAMP NOT NULL,
    size TEXT,
    status backup_status DEFAULT 'Success'
);

CREATE TABLE survey (
    survey_id SERIAL PRIMARY KEY,
    barangay_id INTEGER REFERENCES barangay(barangay_id),
    status survey_status DEFAULT 'draft',
    analyzed_data TEXT,
    raw_data TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE survey_cycle (
    cycle_id SERIAL PRIMARY KEY,
    year TEXT NOT NULL,
    status survey_cycle_status DEFAULT 'Active',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    responses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE survey_response (
    response_id SERIAL PRIMARY KEY,
    survey_number TEXT UNIQUE NOT NULL,
    barangay_id INTEGER REFERENCES barangay(barangay_id),
    interviewer_id INTEGER REFERENCES "user"(id),
    respondent_name TEXT,
    respondent_age INTEGER,
    respondent_gender survey_response_respondent_gender,
    location_lat DECIMAL NOT NULL,
    location_lng DECIMAL NOT NULL,
    location_address TEXT,
    location_accuracy DECIMAL,
    location_timestamp TIMESTAMP,
    location_barangay TEXT,
    location_municipality TEXT,
    location_province TEXT,
    status survey_response_status DEFAULT 'draft',
    progress INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE survey_section (
    section_id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES survey_response(response_id),
    section_name TEXT NOT NULL,
    section_key TEXT NOT NULL,
    status survey_section_status DEFAULT 'pending',
    data TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(response_id, section_key)
);

CREATE TABLE survey_question (
    question_id SERIAL PRIMARY KEY,
    section_id INTEGER REFERENCES survey_section(section_id),
    question_key TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type survey_question_question_type NOT NULL,
    options TEXT,
    required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    depends_on TEXT,
    depends_value TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE survey_answer (
    answer_id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES survey_question(question_id),
    response_id INTEGER REFERENCES survey_response(response_id),
    answer_value TEXT,
    answer_options TEXT,
    answer_text TEXT,
    answer_number DECIMAL,
    answer_rating INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE(question_id, response_id)
);

CREATE TABLE survey_attachment (
    attachment_id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES survey_response(response_id),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE survey_log (
    log_id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES survey(survey_id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE survey_metadata (
    metadata_id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES survey_response(response_id),
    key_name TEXT NOT NULL,
    key_value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(response_id, key_name)
);

CREATE TABLE survey_validation (
    validation_id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES survey_response(response_id),
    validation_type survey_validation_validation_type NOT NULL,
    validation_status survey_validation_validation_status NOT NULL,
    validation_message TEXT,
    validation_data TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE barangay_history (
    history_id SERIAL PRIMARY KEY,
    barangay_id INTEGER REFERENCES barangay(barangay_id),
    year TEXT NOT NULL,
    status TEXT NOT NULL,
    score TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- Insert sample barangays
INSERT INTO barangay (barangay_name, seal, description, households, population, captain) VALUES
('Barangay 1', 'no', 'First barangay', 100, 500, 'Captain One'),
('Barangay 2', 'yes', 'Second barangay', 150, 750, 'Captain Two'),
('Barangay 3', 'no', 'Third barangay', 120, 600, 'Captain Three');

-- Insert sample users
INSERT INTO "user" (email, password, "firstName", "lastName", role) VALUES
('admin@sigla.com', '$2b$10$example', 'Admin', 'User', 'Admin'),
('interviewer@sigla.com', '$2b$10$example', 'Interviewer', 'One', 'Interviewer');

SELECT 'Database setup complete!' as message;