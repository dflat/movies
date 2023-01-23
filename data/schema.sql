DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS movie;
DROP TABLE IF EXISTS movie_session;
DROP TABLE IF EXISTS rank;

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  ip_addr TEXT,
  created TIMESTAMP NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
);

CREATE TABLE session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  viewer_count INTEGER DEFAULT 6,
  created TIMESTAMP NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
);

CREATE TABLE movie (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  tmdb_id TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  summary TEXT,
  created TIMESTAMP NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
);

CREATE TABLE movie_session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  locked_vote BOOL DEFAULT FALSE,
  created TIMESTAMP NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  FOREIGN KEY (session_id) REFERENCES session (id),
  FOREIGN KEY (movie_id) REFERENCES movie (id),
  FOREIGN KEY (user_id) REFERENCES user (id)

);

CREATE TABLE rank (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  movie_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
  FOREIGN KEY (session_id) REFERENCES session (id),
  FOREIGN KEY (movie_id) REFERENCES movie (id),
  FOREIGN KEY (user_id) REFERENCES user (id)
);
