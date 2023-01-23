import tmdbsimple as tmdb
from difflib import SequenceMatcher
import requests
API_KEY = "60b46634db254955b5ae4abdef23e7b3"
tmdb.API_KEY = API_KEY
tmdb.REQUESTS_TIMEOUT = 5
API_VIDS = "https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=" + API_KEY
YOUTUBE = "https://www.youtube.com/embed/"

def get_trailer_url(movie_id):
    movie = tmdb.Movies(movie_id)
    trailers = [v for v in movie.videos().get('results')
                if v['type'] == 'Trailer' and v['site'] == 'YouTube']
    return YOUTUBE + trailers[0].get('key')

def get_trailer_playlist(movie_ids):
    youtube_ids = []
    for movie_id in movie_ids:
        movie = tmdb.Movies(movie_id)
        trailers = [v for v in movie.videos().get('results')
                    if v['type'] == 'Trailer' and v['site'] == 'YouTube']
        youtube_ids.append(trailers[0].get('key'))
    first = youtube_ids[0]
    return YOUTUBE + first + '?playlist=' + ','.join(youtube_ids)

def search_title(title):
    search = tmdb.Search()
    resp = search.movie(query=title)
    if search.results:
        return sorted(search.results, key=lambda x: compare_title(x['title'], title),
                      reverse=True)[0]


def compare_title(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()