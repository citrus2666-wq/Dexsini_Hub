-- 1. Create Enums
CREATE TYPE user_role_enum AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN');
CREATE TYPE leave_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE ot_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE holiday_type_enum AS ENUM ('PUBLIC', 'OPTIONAL');

-- 2. Create Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role_enum NOT NULL,
    designation VARCHAR(100),
    manager_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE leave_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    default_days_per_year INT NOT NULL,
    carry_forward BOOLEAN DEFAULT FALSE,
    color_hex VARCHAR(7) NOT NULL
);

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days FLOAT NOT NULL,
    status leave_status_enum DEFAULT 'PENDING',
    reason TEXT,
    manager_comment TEXT,
    approver_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_leave_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_approver FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_leave_user_status ON leave_requests(user_id, status);
CREATE INDEX idx_leave_date_range ON leave_requests(start_date, end_date);

CREATE TABLE overtime_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    ot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours FLOAT NOT NULL,
    status ot_status_enum DEFAULT 'PENDING',
    reason TEXT NOT NULL,
    manager_comment TEXT,
    approver_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_ot_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ot_approver FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE holidays (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type holiday_type_enum DEFAULT 'PUBLIC',
    is_recurring BOOLEAN DEFAULT TRUE
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(50),
    entity_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Functions & Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_leave_requests_updated
BEFORE UPDATE ON leave_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
