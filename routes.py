# movie ranking web service
from flask import Flask, render_template, request, jsonify, redirect, url_for, Response
import pickle
import db as DB
import tmdb_api as tmdb
import utils
from json import JSONEncoder
POSTER_PATH = "https://image.tmdb.org/t/p/w600_and_h900_bestv2" 
BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280"
DEFAULT_POSTER = '/svYyAWAH3RThMmHcCaJZ97jnTtT.jpg'
app = Flask(__name__)

@app.route('/api/reset')
def api_reset():
    DB.init_db()
    for username in ['Austyn','Ricky','Mciver','Nestor','Ann Marie', 'Ric']:
        register_user(username, ip_addr="bullshit")        
    advance_session()

    # TODO: commented out for testing movie search.html page functionality
    # for ix, title in enumerate(['Melancholia', 'Midsommar', 'The Matrix',
    #                             'Fargo', 'Perfect Blue', 'Pulp Fiction']):
    #     movie_id = submit_movie(title, user_id=ix+1) 
    #     print('movie added to db:', title, movie_id)

    return jsonify("database was reset")

@app.route('/api/advance')
def api_advance():
    advance_session()
    return jsonify("database session was advanced")

@app.route('/api/vote', methods=['POST'])
def api_vote():
    rankings = request.get_json()
    user_id = int(request.args['user_id']) # client posts user_id in query string
    print('GOT USER ID:', user_id)
    session = get_current_session()
    post_rankings(user_id, session, rankings)
    return rankings

@app.route('/api/vote/lock')
def api_vote_lock():
    user_id = int(request.args['user_id']) # client posts user_id in query string
    session_id = get_current_session()['id']
    print('DATA:', user_id, session_id)
    update_lock_status(True, session_id, user_id)
    return jsonify('done')

@app.route('/api/vote/unlock')
def api_vote_unlock():
    user_id = int(request.args['user_id'])
    session_id = get_current_session()['id']
    update_lock_status(False, session_id, user_id)
    return jsonify('done')

@app.route('/api/vote/status')
def api_vote_status():
    user_id = int(request.args['user_id'])
    session_id = get_current_session()['id']
    status = get_lock_status(session_id, user_id)
    return jsonify(status)

@app.route('/api/movie/submit', methods=['POST'])
def api_submit_movie():
    movie_info = request.get_json()
    user_id = int(request.args['user_id']) # client posts user_id in query string
    print('GOT MOVIE SUBMISSION FROM USER ID:', user_id)
    movie_id = submit_movie(movie_info['title'], user_id)
    return jsonify(movie_id)

@app.route('/api/ranks')
def api_ranks():
    session_id, rankings, movie_ids, user_ids, rankings_by_movie = get_ranking_data()
    totals = {} 
    for movie_id in movie_ids:
        totals[movie_id] = sum(r.rank for r in rankings if r.movie_id == movie_id)
    sorted_totals = dict(sorted(totals.items(), key=lambda item: item[1]))
    scores = {k:utils.score_movie(raw_score=v,
                                    n_submissions=len(user_ids),
                                    n_choices=len(movie_ids))
                                    for k,v in sorted_totals.items()}
    locked = get_locked_users(session_id)
    return jsonify(dict(ranks_by_movie=rankings_by_movie, scores=scores, locked=locked))

def get_lock_status(session_id, user_id):
    with DB.get_db() as db: 
        select = 'SELECT * FROM movie_session WHERE session_id = (?) AND user_id = (?);'
        cur = db.execute(select, (session_id, user_id))
        return cur.fetchone()['locked_vote']

def get_locked_users(session_id):
    with DB.get_db() as db: 
        select = 'SELECT user_id, locked_vote FROM movie_session WHERE session_id = (?);'
        cur = db.execute(select, (session_id,))
        results =  {r['user_id']:r['locked_vote'] for r in cur.fetchall()}
        return results

def update_lock_status(status, session_id, user_id):
    with DB.get_db() as db: 
        update = 'UPDATE movie_session SET locked_vote = (?) \
                  WHERE session_id = (?) AND user_id = (?);'
        db.execute(update, (status, session_id, user_id))

def submit_movie(movie_name, user_id) -> int:
    # First, register into movie table, or fetch if exists
    movie_id = register_movie(movie_name) 

    # Then, add to movie_session table under the current session
    session_id = get_current_session()['id']
    add_movie_to_session(session_id, movie_id, user_id)

    return movie_id

def add_movie_to_session(session_id, movie_id, user_id):
    with DB.get_db() as db: 
        # todo: UPDATE FIRST , check if changes, if not insert..
        cur = db.execute('INSERT INTO movie_session (session_id, movie_id, user_id) \
                          VALUES (?,?,?);', (session_id, movie_id, user_id))
        return cur.lastrowid

def register_movie(movie_name) -> int:
    # check if tmdb finds movie title
    tmdb_data = tmdb.search_title(movie_name)
    if not tmdb_data:
        print('not a valid movie title:', movie_name)
        #TODO, handle this
        tmdb_data = {'id':None, 'poster_path': DEFAULT_POSTER, 'title':movie_name}

    # check if movie is in local db
    title = tmdb_data['title']
    movie_id = get_movie_id_from_name(title)
    if movie_id:
        print('movie already exists in db:', title)
        return movie_id
    with DB.get_db() as db: 
        poster_path = tmdb_data.get('poster_path') or DEFAULT_POSTER
        backdrop_path = tmdb_data.get('backdrop_path') or DEFAULT_POSTER #TODO backdrop
        summary = tmdb_data.get('overview') or 'No Summary Available.'
        cur = db.execute('INSERT INTO movie (title, tmdb_id, poster_path, backdrop_path, summary) \
                            VALUES (?,?,?,?,?);', (tmdb_data['title'], tmdb_data['id'], 
                            poster_path, backdrop_path, summary))
        return cur.lastrowid

def get_user(username):
    with DB.get_db() as db: 
        user = db.execute('SELECT * FROM user WHERE username = (?);', (username,)).fetchone()
        if user:
            return user

def get_user_by_id(user_id):
    with DB.get_db() as db: 
        user = db.execute('SELECT * FROM user WHERE id = (?);', (user_id,)).fetchone()
        if user:
            return User(*user)

def get_users():
    with DB.get_db() as db: 
        users = db.execute('SELECT * FROM user;').fetchall()
        return [User(*u) for u in users]

def register_user(username, ip_addr):
    with DB.get_db() as db: 
        cur = db.execute('INSERT INTO user (username, ip_addr) \
                          VALUES (?,?);', (username, ip_addr))

def get_movie_id_from_name(movie_name):
    print('movie_name', movie_name)
    with DB.get_db() as db: 
        cur = db.execute('SELECT * FROM movie WHERE title = (?);', (movie_name,))
        result = cur.fetchone()
        print('rowcount for movie name:', movie_name, result)
    return result['id'] if result else None

def get_movie_by_id(movie_id):
    with DB.get_db() as db: 
        cur = db.execute('SELECT * FROM movie WHERE id = (?);', (movie_id,))
        return Movie(*cur.fetchone())

def get_username_by_id(user_id):
    with DB.get_db() as db: 
        cur = db.execute('SELECT * FROM user WHERE id = (?);', (user_id,))
        return cur.fetchone()['username']

def get_rankings_by_session(session_id):
    with DB.get_db() as db: 
        cur = db.execute('SELECT * FROM rank WHERE session_id = (?);', (session_id,))
        return cur.fetchall()

def get_ranking_data():
    session_id = get_current_session()['id']
    rankings = [Rank(*r) for r in get_rankings_by_session(session_id)]
    movie_ids = set(r.movie_id for r in rankings)
    user_ids = set(r.user_id for r in rankings)
    rankings_by_movie = utils.group_by(rankings, "movie_id")
    return session_id, rankings, movie_ids, user_ids, rankings_by_movie

def update_rankings_for_user(user_id, session_id, rank):
    pass

def post_rankings(user_id, session, rankings):
    # TODO.. handle this check client side to avoid unneccesary polling of server
    # 2 checks.. all viewers have submitted, and len(rankings) == len(*unique* movie submissions)
    submissions = get_user_submissions_by_session(session['id'])
    submission_count = len(submissions)
    unique_movie_count = len(set(submissions.values()))
    if submission_count < session['viewer_count']:
        print(f'not everyone ({len(submissions)}/{session["viewer_count"]}) has submitted a film. ignoring ranks.')
        return 
    if len(rankings) < unique_movie_count:
        print(f'Not every movie ranked. ignoring ranks.')
        return
    session_id = session['id']
    with DB.get_db() as db: 
        # check if duplicate submission
        cur = db.execute('SELECT user_id FROM rank WHERE session_id = (?);', (session_id,))
        already_ranked_user_ids = [r[0] for r in cur.fetchall()]
        dupe = True if user_id in already_ranked_user_ids else False

        for movie_id, rank in rankings.items():
            if dupe:
                update = 'UPDATE rank SET rank = (?) \
                          WHERE session_id = (?) AND user_id = (?) AND movie_id = (?);'
                db.execute(update, (rank, session_id, user_id, movie_id))
            else:
                cur = db.execute('INSERT INTO rank (session_id, user_id, movie_id, rank) \
                                  VALUES (?,?,?,?);', (session_id, user_id, movie_id, rank))

def advance_session():
    with DB.get_db() as db: 
        cur = db.execute('INSERT INTO session DEFAULT VALUES;')

def get_current_session():
    with DB.get_db() as db: 
        return db.execute('SELECT * FROM session ORDER BY id DESC LIMIT 1;').fetchone()

def get_movies_by_session(session_id):
    with DB.get_db() as db: 
        # todo: JOIN on movie
        cur = db.execute('SELECT movie_id FROM movie_session WHERE session_id = (?);', (session_id,))
        movie_ids = [r[0] for r in cur.fetchall()]
        movies = get_movies_by_ids(movie_ids)
        return movies

def get_user_submissions_by_session(session_id):
    """
    Input: session_id:int
    Returns: a map of {user_id:int => movie_id:int}
    """
    with DB.get_db() as db: 
        cur = db.execute('SELECT user_id, movie_id FROM movie_session WHERE session_id = (?);',
                        (session_id,))
        return {r['user_id']:r['movie_id'] for r in cur.fetchall()} 

def get_movies_by_ids(movie_ids):
    with DB.get_db() as db: 
        sql = 'SELECT * FROM movie WHERE id IN ({});'
        sql = sql.format(', '.join('?'*len(movie_ids)))
        print(sql)
        cur = db.execute(sql, movie_ids)
        return [Movie(*m) for m in cur.fetchall()]

def get_ranked_order_by_user_id(session_id, user_id):
    with DB.get_db() as db: 
        cur = db.execute('SELECT movie_id, rank FROM rank \
                          WHERE session_id = (?) AND user_id = (?);',
                        (session_id, user_id))
        ranks = {r['movie_id']:r['rank'] for r in cur.fetchall()}
        return dict(sorted(ranks.items(), key=lambda item: item[1]))

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





@app.route('/results', methods=['GET'])
def results():
    # pull cumulative ranking data to display
    # TODO: pull movies from movie_session table, to decouple from whether rankings posted or not
    session_id, rankings, movie_ids, user_ids, rankings_by_movie = get_ranking_data()
    totals = {}
    movies = {}
    for movie_id in movie_ids:
        movie = get_movie_by_id(movie_id)
        print(movie)
        movies[movie_id] = movie
        totals[movie_id] = sum(r.rank for r in rankings if r.movie_id == movie_id)
    sorted_totals = dict(sorted(totals.items(), key=lambda item: item[1]))
    sorted_movies = dict(sorted(movies.items(), key=lambda item: totals[item[1].id]))
    scores = {k:utils.score_movie(raw_score=v,
                                    n_submissions=len(user_ids),
                                    n_choices=len(movie_ids))
                                    for k,v in sorted_totals.items()}
    # movies, users, rankings_by_user, sorted_totals    
    return render_template('results.html', movies=sorted_movies, rankings=rankings_by_movie,
                            totals=totals, scores=scores)

@app.route('/trailers', methods=['GET'])
def trailers():
    session_id = get_current_session()['id']
    movies = get_movies_by_session(session_id)
    #trailer_urls = [tmdb.get_trailer_url(m.tmdb_id) for m in movies]
    trailer_playlist = tmdb.get_trailer_playlist(m.tmdb_id for m in movies)
    return render_template('trailers.html', trailer_urls=trailer_playlist)

@app.route('/choose', methods=['GET'])
def choose():
    users = get_users()
    return render_template('choose.html', users=users)

@app.route('/search/<user_id>', methods=['GET'])
def search(user_id):
    user_profile = get_user_by_id(user_id)
    return render_template('search.html', user=user_profile)

@app.route('/vote/<user_id>', methods=['GET'])
def vote_get(user_id):
    session_id = get_current_session()['id']
    user_profile = get_user_by_id(user_id)
    print("USER:", user_profile)

    # Check if user has submitted film for this session (in movie_session table)
    #       If not, redirect to search.html page.
    #       If so, continue to vote.html
    submissions = get_user_submissions_by_session(session_id)
    order = list(get_ranked_order_by_user_id(session_id, user_id).keys())
    print('ORDER:', order)
    if int(user_id) in submissions:
        # user has already submitted a film, continue to voting page
        movies = get_movies_by_session(session_id)
        return render_template('vote.html', movies=movies, user=user_profile, order=order)
    else:
        # user has yet to submit a film, redirect them to movie search page
        print('sending to choose a movie...', user_profile.username)
        return redirect(url_for('search', user_id=user_id))
        #return render_template('search.html', user=user_profile)


@app.route('/test', methods=['GET'])
def test():
    return render_template('test.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
