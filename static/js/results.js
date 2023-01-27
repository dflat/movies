/* results.js */
HOST = '192.168.1.171'
API_ENDPOINT = '/api'

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

var sortable;
function init() {
	//alert(window.screen.width)
    console.log('app started...');
    console.log(rankings_)
    console.log(data_from_server['rankings'])
    //Chart.defaults.backgroundColor = '#0000ff';
    Chart.defaults.borderColor = '#2a2a2a';

    preload_backdrops();
    make_bar_charts();

    var el = document.getElementById('content');
	sortable = new Sortable(el, {
      animation:550,
      disabled:true, /* don't allow user to drag order, controlled by server */
      //delay:1000,
      //forceFallback:true,
	});

    update_display();
	setInterval(update_display, 1000);
}

function update_display() {
	fetch_rank_data();
}

const urlParams = new URLSearchParams(window.location.search);
const obscured_param = urlParams.get('obscured');

var rank_data; /* global */
function fetch_rank_data() {
	/* api call */
	url = API_ENDPOINT + '/ranks'
    ajax_request(url, update_rank_data);
}

function update_rank_data(data) {
	let new_rank_data = JSON.parse(data.response);
	if (JSON.stringify(new_rank_data) == JSON.stringify(rank_data)) {
		console.log('no update to rank data.')
		return
	}

	console.log('rank data changed...')
	rank_data = new_rank_data //JSON.parse(data.response); ###testing This
    update_chart_data();
    update_scores();
    color_scores();
    sort_movies();
    relabel_ranks();

    if (obscured_param)
	    obscure_or_reveal_images();

	update_background_image();
	update_locked_counter();
}

function update_locked_counter() {
	if (Object.keys(rank_data['locked']).length == 0) {
		console.log('no locked or rank data yet..')
		return;
	}
	let locked_users = rank_data['locked'];
	let n = Object.keys(locked_users).length;
	let n_locked = Object.values(locked_users).reduce((acc,cur) => acc+cur);
	let node = document.getElementById('locked-counter-text')
	node.innerText = `${n_locked}/${n} Votes`

}

var obscured = false;
function obscure_or_reveal_images() {
	let locked_users = rank_data['locked'];
	let n = Object.keys(locked_users).length;
	let n_locked = Object.values(locked_users).reduce((acc,cur) => acc+cur);
	console.log('n_locked', n_locked, n);
	if (!obscured && n_locked < n) {
		// obscure
		obscured = true;
		obscure_images();
	}
	else if (obscured && n_locked == n) {
		// unobscure
		obscured = false;
		unobscure_images();
	}
}

function obscure_images() {
	ms = document.querySelectorAll('.movie-poster')
	tits = document.querySelectorAll('.movie-title')
	bg = document.querySelector('.background-container')
	ms.forEach(m => {
	  m.classList.add('obscured')
	})
	tits.forEach(m => {
	  m.classList.add('obscured')
	})
	bg.classList.add('obscured')
}

function unobscure_images() {
	ms = document.querySelectorAll('.movie-poster')
	tits = document.querySelectorAll('.movie-title')
	bg = document.querySelector('.background-container')
	ms.forEach(m => {
	  m.classList.remove('obscured')
	})
	tits.forEach(m => {
	  m.classList.remove('obscured')
	})
	bg.classList.remove('obscured')
}

function update_chart_data() {
	let ranks = rank_data['ranks_by_movie'];
	if (!Object.keys(ranks).length)
		return;
	Object.keys(charts).forEach( (movie_id) => {
		let chart = charts[movie_id]
	    let vals = [0,0,0,0,0,0] // todo: make array size dynamic, not hardcoded to 6
	    let ranklist = ranks[movie_id];
	    ranklist.forEach((r,ix) => {
	      vals[r['rank']-1] += 1;
	    });
	    chart.data.datasets[0].data = vals;
	    chart.update();
	});
}

function update_scores() {
	let movies = document.querySelectorAll('.movie')
	let scores = rank_data['scores']
	if (!Object.keys(scores).length)
		return;
	movies.forEach(movie => {
		let movie_id = parseInt(movie.attributes['data-id'].value)
		let score = scores[movie_id]
		let rank_node = movie.querySelector('.movie-rank')
		rank_node.attributes['data'].value = score
		rank_node.querySelector('h3').innerText = score + '%'
	})
}

function sort_movies() {
	let sorted = Object.entries(rank_data['scores']).sort((a, b) => b[1] - a[1]);
	let order = [];
    sorted.forEach(r => {
    	order.push(r[0])
    });
    sortable.sort(order, true);
}

function relabel_ranks() {
  console.log('relabelling');
  let movie_rank_nodes = document.querySelectorAll('#content .rank-emblem');
  movie_rank_nodes.forEach((m, ix) => {
    m.innerText = ix + 1;
  });

  let ranks = {};
  let movies = document.querySelectorAll('#items .movie-info .movie-title');
 console.log(movies)
  movies.forEach((m,ix) => {
    let movie_id = parseInt(m.attributes.data.value);
    ranks[movie_id] = ix + 1;
  });
}

var backdrops = {}
function preload_backdrops() {
	let nodes = document.querySelectorAll('.movie')
	nodes.forEach(n => {
		let movie_id = parseInt(n.attributes['data-id'].value)
		// TODO: fix querySelector here...
		let info = n.querySelector('.movie-info')
		let url = info.attributes.backdrop.value
		console.log('URL', url)
		let img = new Image()
		img.src = url
		img.classList.add('bg-img')
		backdrops[movie_id] = img
	})
}

function update_background_image() {
	/* todo: preload all images, use a hidden/reveal class toggle */
	//let first_movie = document.querySelector('.movie-info');
	//let backdrop_url = first_movie.attributes.backdrop.value;
	//document.querySelector('.bg-img').src =  backdrop_url;

	let first_movie = document.querySelector('.movie');
	if (!first_movie)
		return;
	movie_id = parseInt(first_movie.attributes['data-id'].value)
	c = document.querySelector('.background-container')
	im = document.querySelector('.bg-img')
	im.remove()
	c.appendChild(backdrops[movie_id])
}

function get_rankings_for_movie(movie_id) {
  query =  `/rankings?movie_id=${movie_id}`
  url = API_ENDPOINT + query;
  ajax_request(url, ajax_request_done);
}

function color_scores() {
  let rank_nodes = document.querySelectorAll('.movie-info .movie-rank');
  rank_nodes.forEach(rank => {
    let val = parseInt(rank.attributes.data.value);
      //console.log(val);
      rank.style.color = get_color(val);
  });
  
}

function rgb(r, g, b){
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  return ["rgb(",r,",",g,",",b,")"].join("");
}

function get_color(val) {
  let x = (val/100)*255
  return rgb(255-x, x, 64);
}

var charts = {}; // movie_id => chart
function make_bar_charts() {
  //let ranks = data_from_server['rankings'];
  let info_nodes = document.querySelectorAll('.movie-info canvas');
  info_nodes.forEach(node => {

    let movie_id = parseInt(node.attributes.data.value);
    let vals = [0,0,0,0,0,0] // todo: make array size dynamic, not hardcoded to 6
    //let ranklist = ranks[movie_id];
    //ranklist.forEach((r,ix) => {
    //  vals[r['rank']-1] += 1;
    //	/});
    charts[movie_id] = make_bar_chart(movie_id, vals);

  });
}

function make_bar_chart(movie_id, yValues) {
  var xValues = ["1st", "2nd", "3rd", "4th", "5th","6th"]; // TODO: don't hardcode to 6 places
  var barColors = ["#00ff55", "#33cc55", "#669966", "#996699", "#cc33cc", "#ff00ff"];

  let options = {
    scales: {
        y: {
            max: 6,
            min: 0,
            ticks: {
              stepSize: 1
            },
            title: {
              display:true,
              text: "Vote Count",
            }
        },
    },
    animation: false,
    plugins: {
      legend: {display: false},
      tooltip: {enabled: false},
    },
    title: {
          display: false,
          text: "Rankings"
        },
  };

 
  let chart = new Chart("myChart"+movie_id, {
    type: "bar",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues,
        barPercentage: 1
      }]
    },

    options: options

  });
  return chart;
}