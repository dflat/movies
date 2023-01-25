/* results.js */
HOST = '192.168.1.171'
API_ENDPOINT = '/api'

document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

function init() {
    console.log('app started...');
    color_scores();
    console.log(rankings_)
    console.log(data_from_server['rankings'])
    //Chart.defaults.backgroundColor = '#0000ff';
    Chart.defaults.borderColor = '#2a2a2a';
    //Chart.defaults.color = '#000';
    make_bar_charts();
	//setInterval(update_display, 1000);
    update_display();
}

function update_display() {
	update_background_image();
}

function update_background_image() {
	/* todo: preload all images, use a hidden/reveal class toggle */
	let first_movie = document.querySelector('.movie-info');
	let backdrop_url = first_movie.attributes.backdrop.value;
	document.querySelector('.bg-img').src =  backdrop_url;
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
      console.log(val);
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

function make_bar_charts() {
  let ranks = data_from_server['rankings'];
  let info_nodes = document.querySelectorAll('.movie-info canvas');
  info_nodes.forEach(node => {
    let vals = [0,0,0,0,0,0] // todo: make array size dynamic, not hardcoded to 6
    let movie_id = parseInt(node.attributes.data.value);
    let ranklist = ranks[movie_id];
    ranklist.forEach((r,ix) => {
      vals[r['rank']-1] += 1;
    });
    make_bar_chart(movie_id, vals);
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

 
  new Chart("myChart"+movie_id, {
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
}