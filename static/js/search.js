//import { ajax_request, ajax_post, load_data_from_server } from './utils.js';

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

function init() {
    console.log('search.js app started...');
    add_event_listeners();
}

const AUTO_SEARCH_CHAR_THRESH = 15;

function add_event_listeners() {
  var input = document.getElementById("movie-search");

  console.log('adding event listeners...')
  console.log(input)
  // Execute a function when the user releases a key on the keyboard
  input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (input.value.length > AUTO_SEARCH_CHAR_THRESH) {
      return search_tmdb(input.value)
    }
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      console.log('enter pressed.');
      search_tmdb(input.value);
    }

  });
}

function attach_listener(node, event_type, func) {
  node.addEventListener(event_type, func);
}

API_KEY = "60b46634db254955b5ae4abdef23e7b3"
API_TMDB = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&page=1`
API_IMG = "https://image.tmdb.org/t/p/w500"

function search_tmdb(title) {
  console.log('searching tmdb for:', title);
  let url = API_TMDB + `&query=${title}`;
  ajax_request(url, parse_movie_results);
}

function parse_movie_results(data) {
  let resp = JSON.parse(data.response)
  let movies = [];
  resp.results.forEach(r => {
    console.log(r.title, r.poster_path);
    // Filter sub-par movie results
    if (r.poster_path != null)
      movies.push(r); 
  });
  populate_movies(movies);
}

function populate_movies(movies) {
  let grid = document.getElementById('movie-results-grid');
  grid.replaceChildren(); // delete any existing children from past searches
  movies.forEach(m => {

    let node = document.createElement('div');
    node.classList.add('movie');
    attach_listener(node, 'click', submit_movie);
    node.info = m;
    let poster_div = document.createElement('div');
    poster_div.classList.add('movie-poster');
    let img = document.createElement('img');
    img.classList.add('poster');
    img.src = API_IMG + m.poster_path;

    poster_div.appendChild(img);
    node.appendChild(poster_div)
    grid.appendChild(node);


  })
}

const api_submit_movie_endpoint = '/api/movie/submit'
function submit_movie(evt) {
  let movie_node = evt.currentTarget;
  let url = api_submit_movie_endpoint + `?user_id=${user_.id}`;
  ajax_post(url, movie_node.info, submit_movie_finished);
}

const VOTE_URL = '/vote'
function submit_movie_finished(data) {
  console.log('movie submitted, id:', data);
  window.location.href = VOTE_URL + `/${user_.id}`;
}