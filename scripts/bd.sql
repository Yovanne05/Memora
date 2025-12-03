DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS flashcards;
DROP TABLE IF EXISTS note_images;
DROP TABLE IF EXISTS note_links;
DROP TABLE IF EXISTS note_shares;
DROP TABLE IF EXISTS collection_shares;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS visibility_enum;
DROP TYPE IF EXISTS permission_enum;


CREATE TYPE visibility_enum AS ENUM ('private', 'public');
CREATE TYPE permission_enum AS ENUM ('read', 'write');

-- ===== TABLES =====

CREATE TABLE users (
    id              CHAR(36) PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(50) UNIQUE,
    display_name    VARCHAR(100),
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP,
    role            VARCHAR(20) NOT NULL DEFAULT 'user'
);

CREATE INDEX idx_users_role ON users (role);

CREATE TABLE collections (
    id           CHAR(36) PRIMARY KEY,
    owner_id     CHAR(36) NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    visibility   visibility_enum NOT NULL DEFAULT 'private',
    tags         TEXT[] DEFAULT '{}',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_collections_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE UNIQUE INDEX uniq_collection_name_per_owner
    ON collections (owner_id, name);

CREATE TABLE notes (
    id             CHAR(36) PRIMARY KEY,
    collection_id  CHAR(36),
    owner_id       CHAR(36) NOT NULL,
    title          VARCHAR(255) NOT NULL,
    content        TEXT NOT NULL,
    visibility     visibility_enum NOT NULL DEFAULT 'private',
    tags           TEXT[] DEFAULT '{}',
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notes_collection
        FOREIGN KEY (collection_id) REFERENCES collections(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_notes_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE UNIQUE INDEX uniq_note_title_per_collection
    ON notes (collection_id, title);

CREATE INDEX idx_notes_collection
    ON notes (collection_id);

CREATE INDEX idx_notes_owner
    ON notes (owner_id);

CREATE TABLE note_images (
    id          CHAR(36) PRIMARY KEY,
    note_id     CHAR(36) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    file_size   INT NOT NULL,
    mime_type   VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_note_images_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_note_images_note ON note_images (note_id);

CREATE TABLE collection_shares (
    collection_id  CHAR(36) NOT NULL,
    user_id        CHAR(36) NOT NULL,
    permission     permission_enum NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, user_id),
    CONSTRAINT fk_coll_shares_collection
        FOREIGN KEY (collection_id) REFERENCES collections(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_coll_shares_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_collection_shares_user
    ON collection_shares (user_id);

CREATE TABLE note_shares (
    note_id     CHAR(36) NOT NULL,
    user_id     CHAR(36) NOT NULL,
    permission  permission_enum NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, user_id),
    CONSTRAINT fk_note_shares_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_note_shares_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_note_shares_user
    ON note_shares (user_id);

CREATE TABLE note_links (
    note_id_1  CHAR(36) NOT NULL,
    note_id_2  CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id_1, note_id_2),
    CONSTRAINT fk_note_links_1
        FOREIGN KEY (note_id_1) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_note_links_2
        FOREIGN KEY (note_id_2) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_note_links_note1
    ON note_links (note_id_1);

CREATE INDEX idx_note_links_note2
    ON note_links (note_id_2);

CREATE TABLE flashcards (
    id             CHAR(36) PRIMARY KEY,
    note_id        CHAR(36) NOT NULL,
    question       TEXT NOT NULL,
    answer         TEXT NOT NULL,
    ease           INT DEFAULT 250,
    interval_days  INT DEFAULT 0,
    repetitions    INT DEFAULT 0,
    streak         INT DEFAULT 0,
    due_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flashcards_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_flashcards_note ON flashcards (note_id);
CREATE INDEX idx_flashcards_due ON flashcards (due_at);
CREATE INDEX idx_flashcards_streak ON flashcards (streak);

CREATE TABLE reviews (
    id             CHAR(36) PRIMARY KEY,
    flashcard_id   CHAR(36) NOT NULL,
    user_id        CHAR(36) NOT NULL,
    quality        INT NOT NULL,
    applied_interval INT NOT NULL,
    reviewed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_due_at    TIMESTAMP NOT NULL,
    CONSTRAINT fk_reviews_flashcard
        FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_reviews_flashcard ON reviews (flashcard_id);
CREATE INDEX idx_reviews_user ON reviews (user_id);
CREATE INDEX idx_reviews_date ON reviews (reviewed_at);
CREATE INDEX idx_reviews_quality ON reviews (quality);

-- ===== TRIGGERS =====

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_collections_updated_at
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_flashcards_updated_at
BEFORE UPDATE ON flashcards
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
