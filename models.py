# models.py
POSTER_PATH = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" 
BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280"

class Rank(dict):
    def __init__(self, id, session_id, user_id, movie_id, rank, ts):
        super().__init__(self, id=id,session_id=session_id,user_id=user_id,movie_id=movie_id,
            rank=rank,ts=ts)
        self.id = id
        self.session_id = session_id
        self.user_id = user_id
        self.movie_id = movie_id
        self.rank = rank 
        self.ts = ts
    def __repr__(self):
        fields = ', '.join(f'{key}={value}' for key, value in self.__dict__.items())
        return f'{self.__class__.__name__}({fields})'
    
class Movie:
    def __init__(self, id, title, tmdb_id, poster_path, backdrop_path, summary, ts):
        self.id = id
        self.title = title
        self.tmdb_id = tmdb_id
        self.poster_path = POSTER_PATH + poster_path
        self.backdrop_path = BACKDROP_PATH + backdrop_path
        self.summary = summary
        self.ts = ts

    def __repr__(self):
        fields = ', '.join(f'{key}={value}' for key, value in self.__dict__.items())
        return f'{self.__class__.__name__}({fields})'

class User(dict):
    def __init__(self, id, username, ip_addr, ts):
        super().__init__(self, id=id, username=username, ip_addr=ip_addr, ts=ts)
        self.id = id
        self.username = username
        self.ip_addr = ip_addr
        self.ts = ts

    def __repr__(self):
        fields = ', '.join(f'{key}={value}' for key, value in self.__dict__.items())
        return f'{self.__class__.__name__}({fields})'