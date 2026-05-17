-- 1. Créer DB
CREATE DATABASE edbm_meeting_room;
\c edbm_meeting_room

-- 2. Tables principales (V2-V5)
CREATE TABLE reservations (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end
