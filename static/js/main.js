/* defunct, replaced by results.js */
/*
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

var data_from_server = {};
function load_data_from_server(attr, val) {
  console.log('got from server: ' + attr + ':' + val)
  data_from_server[attr] = val;
  return val; // TODO: this return is experimental and redundant, since data is logged in global obj.
}

function ajax_request(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.onloadend = function(e){
        callback(xhr);
    };
    xhr.open('GET', url);
    xhr.send();
}

function ajax_post(url, payload, callback){
    var xhr = new XMLHttpRequest();
    xhr.onloadend = function(e){
        callback(xhr);
    };
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(payload));
}

function ajax_request_done(data) {
    console.log('ajax request finished')
    console.log(data);
}

HOST = '192.168.1.171'
API_ENDPOINT = '/api'

function init() {
    console.log('app started...');
    color_scores();
    console.log(rankings_)
    console.log(data_from_server['rankings'])
    //Chart.defaults.backgroundColor = '#0000ff';
    Chart.defaults.borderColor = '#2a2a2a';
    //Chart.defaults.color = '#000';
    make_bar_charts();
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
  var barColors = ["#00ff55", "#33cc55", "#669966", "#996699", "#cc33cc", "#ff00ff"];//'rgba(119, 64, 165, 1)';//rgb(33, 168, 221)';//'rgb(191, 77, 244)'; //'rgb(96, 255, 203)'// "rgba(50,250,50,.8)" //["red", "green","blue","orange","brown"];

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

*/
