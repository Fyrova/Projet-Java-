-- =====================================================
-- SCHÉMA COMPLET EDBM Meeting Room Management
-- PostgreSQL 15+ | Flyway migrations
-- =====================================================

-- 1. DATABASE
CREATE DATABASE edbm_meeting_room;

-- 2. TABLES PRINCIPALES
\c edbm_meeting_room;

-- ROLES
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES 
('USER'), ('ORGANIZER'), ('ADMIN');

-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROOMS (Salles)
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER DEFAULT 10,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rooms (name, capacity, location) VALUES
('Salle A', 12, 'Bâtiment A - Étage 1'),
('Salle B', 8, 'Bâtiment A - Étage 2'),
('Salle C', 20, 'Bâtiment B - RDC'),
('Salle Réunion Dir.', 6, 'Bâtiment A - Étage 3');

-- RESERVATIONS
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    organizer_id BIGINT REFERENCES users(id),
    room_id BIGINT REFERENCES rooms(id),
    departement VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','CANCELLED')),
    parent_reservation_id BIGINT REFERENCES reservations(id),
    recurrence_rule TEXT,
    participants_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reminder_sent_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vues migration V5
UPDATE reservations SET room_id = 1 WHERE room_id IS NULL;
ALTER TABLE reservations ALTER COLUMN room_id SET NOT NULL;

-- HISTORIQUE
CREATE TABLE reservation_history (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT REFERENCES reservations(id),
    action VARCHAR(50),
    old_data JSONB,
    new_data JSONB,
    changed_by BIGINT REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOGS EMAIL
CREATE TABLE email_log (
    id BIGSERIAL PRIMARY KEY,
    to_email VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    error_message TEXT
);

-- INDEXES PERFORMANCE
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_room_date ON reservations(room_id, date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_organizer ON reservations(organizer_id);
CREATE INDEX idx_reservations_parent ON reservations(parent_reservation_id);

-- =====================================================
-- DONNÉES TEST
-- =====================================================

-- Utilisateurs test
INSERT INTO users (name, email, password, role_id) VALUES
('Admin EDBM', 'admin@edbm.fr', '$2a$10$demo', 3),
('Organisateur A', 'orga@edbm.fr', '$2a$10$demo', 2),
('User Test', 'user@edbm.fr', '$2a$10$demo', 1);

-- Réservation test
INSERT INTO reservations (subject, date, start_time, end_time, organizer_id, room_id, departement, status) VALUES
('Réunion Équipe', '2024-03-25', '09:00', '10:30', 2, 1, 'IT', 'CONFIRMED');

-- =====================================================
-- VUES UTILITAIRES
-- =====================================================

-- Réservations par jour/salle
CREATE VIEW v_reservations_daily AS
SELECT 
    date, 
    room_id, 
    COUNT(*) as total,
    SUM(CASE WHEN status='CONFIRMED' THEN 1 ELSE 0 END) as confirmed
FROM reservations 
GROUP BY date, room_id;

-- Utilisation salles
CREATE VIEW v_room_utilization AS
SELECT 
    r.name as room_name,
    COUNT(*) as total_reservations,
    AVG(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as avg_hours
FROM reservations res
JOIN rooms r ON res.room_id = r.id
WHERE status = 'CONFIRMED'
GROUP BY r.id, r.name;

-- =====================================================
-- BACKUP / MAINTENANCE
-- =====================================================

-- Backup script
-- pg_dump -h localhost -U postgres -d edbm_meeting_room > backup_$(date +%Y%m%d).sql

-- Nettoyage logs email échoués (>30j)
DELETE FROM email_log WHERE status = 'FAILED' AND sent_at < NOW() - INTERVAL '30 days';

-- =====================================================
*EDBM Meeting Room - Schéma complet & données test*
