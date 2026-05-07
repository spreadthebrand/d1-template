-- Migration number: 0002    2026-05-07T00:00:00.000Z
CREATE TABLE IF NOT EXISTS intern_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    desired_role TEXT NOT NULL DEFAULT 'New Lead',
    resume_received TEXT NOT NULL DEFAULT 'No',
    portfolio_received TEXT NOT NULL DEFAULT 'No',
    interview_status TEXT NOT NULL DEFAULT 'New Lead',
    notes TEXT NOT NULL DEFAULT '',
    final_placement TEXT NOT NULL DEFAULT '',
    weekly_availability TEXT NOT NULL DEFAULT '',
    portfolio_url TEXT NOT NULL DEFAULT '',
    resume_file_name TEXT NOT NULL DEFAULT '',
    portfolio_file_name TEXT NOT NULL DEFAULT '',
    google_drive_resume_url TEXT NOT NULL DEFAULT '',
    google_drive_portfolio_url TEXT NOT NULL DEFAULT '',
    trial_assignment TEXT NOT NULL DEFAULT '',
    priority_level TEXT NOT NULL DEFAULT 'Normal',
    source TEXT NOT NULL DEFAULT 'Intern Intake Form',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_contacted_at TEXT,
    UNIQUE(candidate_name, desired_role)
);

CREATE INDEX IF NOT EXISTS idx_intern_candidates_status ON intern_candidates(interview_status);
CREATE INDEX IF NOT EXISTS idx_intern_candidates_role ON intern_candidates(desired_role);
CREATE INDEX IF NOT EXISTS idx_intern_candidates_priority ON intern_candidates(priority_level);

CREATE TABLE IF NOT EXISTS intern_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER,
    action TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(candidate_id) REFERENCES intern_candidates(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO intern_candidates
(candidate_name, desired_role, resume_received, portfolio_received, interview_status, notes, priority_level, source)
VALUES
('Devon L. Barnett', 'Graphic Design Intern', 'No', 'No', 'Resume Requested', 'Highest priority: only graphic design candidate. Contact immediately and request resume plus design samples.', 'Highest', 'Initial intern placement report'),
('Tycian White', 'Photography Intern', 'No', 'No', 'Resume Requested', 'Highest priority: best direct match for photography. Request portfolio/sample work and schedule interview.', 'Highest', 'Initial intern placement report'),
('William Williams', 'Marketing Intern', 'No', 'No', 'Resume Requested', 'Highest priority: strongest fit for artist-facing marketing. Request resume and schedule interview.', 'Highest', 'Initial intern placement report'),
('Elijah Victorian', 'A&R Intern', 'No', 'No', 'Resume Requested', 'Highest priority: artist/producer/engineer background. Request resume, portfolio, and music links.', 'Highest', 'Initial intern placement report'),
('Robert Garcia', 'Studio Staff Intern', 'Yes', 'No', 'Resume Received', 'Highest priority: resume received. Strong studio support candidate. Schedule group interview.', 'Highest', 'Initial intern placement report'),
('Ralph Onwumere', 'Studio Staff Intern', 'Yes', 'No', 'Resume Received', 'Highest priority: resume received. Audio engineer background. Schedule group interview.', 'Highest', 'Initial intern placement report'),
('Cesar Sifuentes', 'Studio Staff Intern', 'Yes', 'No', 'Resume Received', 'Highest priority: resume received. HCC audio engineering background. Schedule group interview.', 'Highest', 'Initial intern placement report'),
('Madeline Herrera', 'Studio Staff / Broadcast Support', 'Yes', 'No', 'Resume Received', 'Highest priority: resume received. Radio broadcast/master engineering background. Schedule group interview.', 'Highest', 'Initial intern placement report'),
('Meaux Melody', 'Marketing Intern', 'No', 'No', 'New Lead', 'Marketing backup candidate.', 'Backup', 'Initial intern placement report'),
('Brandon Molina', 'Marketing Intern', 'No', 'No', 'New Lead', 'Marketing backup candidate.', 'Backup', 'Initial intern placement report'),
('Kareem Alsabur', 'Marketing / Producer Intern', 'No', 'No', 'New Lead', 'Marketing and producer backup candidate.', 'Backup', 'Initial intern placement report'),
('Alan Jackson', 'A&R Intern', 'No', 'No', 'New Lead', 'A&R backup candidate.', 'Backup', 'Initial intern placement report'),
('Keenon Taylor II', 'A&R Intern', 'No', 'No', 'New Lead', 'A&R backup candidate.', 'Backup', 'Initial intern placement report'),
('Eduardo Primera', 'A&R Intern', 'No', 'No', 'New Lead', 'A&R backup candidate.', 'Backup', 'Initial intern placement report'),
('Jonah Donnell', 'Photography Intern', 'No', 'No', 'New Lead', 'Photography backup candidate.', 'Backup', 'Initial intern placement report'),
('Esperanza Nolasco', 'Photography Intern', 'No', 'No', 'New Lead', 'Photography backup candidate.', 'Backup', 'Initial intern placement report'),
('Mason Richards', 'Producer Intern', 'No', 'No', 'New Lead', 'Top producer candidate. Request beat links/music samples.', 'High', 'Initial intern placement report'),
('Trevin Richards', 'Producer Intern', 'No', 'No', 'New Lead', 'Top producer candidate. Request beat links/music samples.', 'High', 'Initial intern placement report'),
('Jordan Moreno', 'Producer Intern', 'No', 'No', 'New Lead', 'Producer backup candidate.', 'Backup', 'Initial intern placement report'),
('Donye Tolbert', 'Producer Intern', 'No', 'No', 'New Lead', 'Producer backup candidate.', 'Backup', 'Initial intern placement report'),
('Anthony Chavarria', 'Producer Intern', 'No', 'No', 'New Lead', 'Producer backup candidate.', 'Backup', 'Initial intern placement report'),
('Martarius Bolden', 'Producer Intern', 'No', 'No', 'New Lead', 'Producer backup candidate.', 'Backup', 'Initial intern placement report');
