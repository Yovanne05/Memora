CREATE TABLE users (
    id              CHAR(36) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(50) UNIQUE,
    display_name    VARCHAR(100),
    password_hash   TEXT NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE collections (
    id           CHAR(36) NOT NULL,
    owner_id     CHAR(36) NOT NULL,
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    visibility   ENUM('private', 'public') NOT NULL DEFAULT 'private',
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
                                          ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_collections_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE UNIQUE INDEX uniq_collection_name_per_owner
    ON collections (owner_id, name);

CREATE TABLE notes (
    id             CHAR(36) NOT NULL,
    collection_id  CHAR(36) NULL,
    owner_id       CHAR(36) NOT NULL,
    title          VARCHAR(255) NOT NULL,
    content        TEXT NOT NULL,
    visibility     ENUM('private', 'public') NOT NULL DEFAULT 'private',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
                                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notes_collection
        FOREIGN KEY (collection_id) REFERENCES collections(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_notes_owner
        FOREIGN KEY (owner_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE UNIQUE INDEX uniq_note_title_per_collection
    ON notes (collection_id, title);

CREATE INDEX idx_notes_collection
    ON notes (collection_id);

CREATE INDEX idx_notes_owner
    ON notes (owner_id);

CREATE TABLE collection_shares (
    collection_id  CHAR(36) NOT NULL,
    user_id        CHAR(36) NOT NULL,
    permission     ENUM('read', 'write') NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, user_id),
    CONSTRAINT fk_coll_shares_collection
        FOREIGN KEY (collection_id) REFERENCES collections(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_coll_shares_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_collection_shares_user
    ON collection_shares (user_id);

CREATE TABLE note_shares (
    note_id     CHAR(36) NOT NULL,
    user_id     CHAR(36) NOT NULL,
    permission  ENUM('read', 'write') NOT NULL,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, user_id),
    CONSTRAINT fk_note_shares_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_note_shares_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_note_shares_user
    ON note_shares (user_id);

CREATE TABLE tags (
    id         CHAR(36) NOT NULL,
    name       VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE collection_tags (
    collection_id CHAR(36) NOT NULL,
    tag_id        CHAR(36) NOT NULL,
    PRIMARY KEY (collection_id, tag_id),
    CONSTRAINT fk_collection_tags_collection
        FOREIGN KEY (collection_id) REFERENCES collections(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_collection_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_collection_tags_tag
    ON collection_tags (tag_id);

CREATE TABLE note_tags (
    note_id CHAR(36) NOT NULL,
    tag_id  CHAR(36) NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_note_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_note_tags_tag
    ON note_tags (tag_id);

CREATE TABLE note_links (
    note_id_1  CHAR(36) NOT NULL,
    note_id_2  CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (note_id_1, note_id_2),

    CONSTRAINT fk_note_links_1
        FOREIGN KEY (note_id_1) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_note_links_2
        FOREIGN KEY (note_id_2) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_note_links_note1
    ON note_links (note_id_1);

CREATE INDEX idx_note_links_note2
    ON note_links (note_id_2);

CREATE TABLE flashcards (
    id         CHAR(36) NOT NULL,
    note_id    CHAR(36) NOT NULL,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
                                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_flashcards_note
        FOREIGN KEY (note_id) REFERENCES notes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_flashcards_note
    ON flashcards (note_id);