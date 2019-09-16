CREATE TABLE note (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    date_modified TIMESTAMP DEFAULT now() NOT NULL,
    note_title TEXT NOT NULL,
    content TEXT,
    folder_id INTEGER REFERENCES folder(id) ON DELETE CASCADE NOT NULL
);