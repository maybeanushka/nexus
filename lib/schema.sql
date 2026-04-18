CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'lab_admin', 'hod_admin', 'principal_admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    lab_status TEXT NOT NULL DEFAULT 'pending' CHECK(lab_status IN ('pending', 'approved', 'rejected')),
    hod_status TEXT NOT NULL DEFAULT 'pending' CHECK(hod_status IN ('pending', 'approved', 'rejected')),
    principal_status TEXT NOT NULL DEFAULT 'pending' CHECK(principal_status IN ('pending', 'approved', 'rejected')),
    overall_status TEXT NOT NULL DEFAULT 'pending' CHECK(overall_status IN ('pending', 'approved', 'rejected')),
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY(student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    doc_type TEXT NOT NULL CHECK(doc_type IN ('id_card', 'library_receipt', 'lab_records')),
    file_url TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(application_id) REFERENCES applications(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    amount REAL NOT NULL,
    qr_data TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'success',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    application_id TEXT NOT NULL,
    actor_id TEXT,
    action TEXT NOT NULL,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(application_id) REFERENCES applications(id),
    FOREIGN KEY(actor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
