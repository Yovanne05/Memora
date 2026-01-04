DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS note_images CASCADE;
DROP TABLE IF EXISTS note_links CASCADE;
DROP TABLE IF EXISTS note_shares CASCADE;
DROP TABLE IF EXISTS collection_shares CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS flashcard_answers CASCADE;


DROP TYPE IF EXISTS visibility_enum;
DROP TYPE IF EXISTS permission_enum;
DROP TYPE IF EXISTS review_difficulty_enum;


CREATE TYPE visibility_enum AS ENUM ('private', 'public');
CREATE TYPE permission_enum AS ENUM ('read', 'write');
CREATE TYPE review_difficulty_enum AS ENUM ('again', 'hard', 'good', 'easy');

-- ===== TABLES =====

CREATE TABLE users (
    id              CHAR(36) PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(50) UNIQUE,
    display_name    VARCHAR(100),
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP,
    role            VARCHAR(20) NOT NULL DEFAULT 'client'
);

CREATE INDEX idx_users_role ON users (role);

CREATE TABLE collections (
    id           CHAR(36) PRIMARY KEY,
    owner_id     CHAR(36) NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    visibility   visibility_enum NOT NULL DEFAULT 'private',
    tags         TEXT[] NOT NULL DEFAULT '{}',
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
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flashcards_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_flashcards_note ON flashcards (note_id);

CREATE TABLE flashcard_answers (
    id             CHAR(36) PRIMARY KEY,
    flashcard_id   CHAR(36) NOT NULL,
    answer_text    TEXT NOT NULL,
    is_correct     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flashcard_answers_flashcard
        FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_flashcard_answers_flashcard ON flashcard_answers (flashcard_id);

CREATE TABLE reviews (
    user_id              CHAR(36) NOT NULL,
    flashcard_id         CHAR(36) NOT NULL,
    selected_answer_id   CHAR(36) NOT NULL,
    is_correct           BOOLEAN NOT NULL,
    difficulty           review_difficulty_enum NOT NULL,
    e_factor             DECIMAL(4,2) NOT NULL DEFAULT 2.5,
    repetitions          INT NOT NULL DEFAULT 0,
    interval_days        INT NOT NULL DEFAULT 0,
    next_review_at       TIMESTAMP NOT NULL,
    reviewed_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, flashcard_id),
    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_flashcard
        FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_answer
        FOREIGN KEY (selected_answer_id) REFERENCES flashcard_answers(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_reviews_user ON reviews (user_id);
CREATE INDEX idx_reviews_flashcard ON reviews (flashcard_id);
CREATE INDEX idx_reviews_next_review ON reviews (user_id, next_review_at);
CREATE INDEX idx_reviews_reviewed_at ON reviews (user_id, reviewed_at);

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
