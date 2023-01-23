import sqlite3

class Database:
    IntegrityError = sqlite3.IntegrityError
    def __init__(self, name):
        self.conn = sqlite3.connect(name, detect_types=sqlite3.PARSE_DECLTYPES)
        self.conn.row_factory = sqlite3.Row

    def execute(self, query, args=()):
        try:
            cursor = self.conn.execute(query, args)
        except Exception as e:
            raise e
        finally:
            self.conn.commit()
        return cursor

    def close(self):
        self.conn.close()
        print('db connection closed')

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # make sure the db connection gets closed
        self.close()

    def __getattr__(self, attr):
        # pass thru to wrapped sqlite3 connection
        return getattr(self.conn, attr)

def get_db():
    return Database('data/movies.db')

def init_db():
    db = get_db()
    with open('data/schema.sql') as f:
        db.executescript(f.read())

    # initialize some test data
#    db.execute('INSERT INTO user (username, emoji) VALUES (?,?);', ('ulla','🌶️'))
#    db.execute('INSERT INTO user (username, emoji) VALUES (?,?);', ('cityboi','🌶️'))

#    db.execute('INSERT INTO hand (player_id, round_id, high_card_id, low_card_id) \
#                VALUES (?,?,?,?);', (1,round_id,52,51))
#    db.execute('INSERT INTO hand (player_id, round_id, high_card_id, low_card_id) \
#                VALUES (?,?,?,?);', (2,round_id,50,49))

    db.close()
