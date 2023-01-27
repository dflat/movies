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

  var container = document.getElementById('movie-results-grid')
  container.addEventListener("click", function(event) {
    // console.log('click target', event.target)
    // console.log('this target', this)
    // console.log(event)
    let movie_selection = document.querySelectorAll('.confirm');
    if (movie_selection.length && this == event.target) {
      console.log('removing...')
      movie_selection[0].remove() 
    }
  });

}

/* // moved to utils.js
function attach_listener(node, event_type, func) {
  node.addEventListener(event_type, func);
}
*/

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
  if (this.classList.contains('confirm')) {
    let url = api_submit_movie_endpoint + `?user_id=${user_.id}`;
    ajax_post(url, movie_node.info, submit_movie_finished);
  }
  else {
    let old_confirm = document.querySelectorAll('.confirm');
    if (old_confirm.length) { // already showing confirmation
      old_confirm.forEach(m => m.remove())
    }
    else { // no confirm showing, show confirm...
      let copy = this.cloneNode(deep=true);
      copy.info = this.info
      //console.log('INFO', this.info, copy.info)
      document.getElementById('movie-results-grid').appendChild(copy)
      copy.classList.add('confirm')
      attach_listener(copy, 'click', submit_movie);
      center_on_page(copy)
    }
    // let copy = this.cloneNode(deep=true);
    // let old_confirm = document.querySelectorAll('.confirm');
    // old_confirm.forEach(m => m.remove())
    // document.getElementById('movie-results-grid').appendChild(copy)
    // copy.classList.add('confirm')

  }
}

function center_on_page(node) {
  let y_off = window.scrollY
  let W = window.innerWidth
  let H = window.innherHeight
  let box = node.getBoundingClientRect()
  let top = y_off + 10 
  let left = W/2 - box.width/2
  console.log('top', top, 'left', left)
  node.style.position = 'absolute'
  node.style.top = top + 'px'
  node.style.left = left + 'px'
}

const VOTE_URL = '/vote'
function submit_movie_finished(data) {
  console.log('movie submitted, id:', data);
  window.location.href = VOTE_URL + `/${user_.id}`;
}