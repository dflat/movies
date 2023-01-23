document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

var sortable;
function init() {
    console.log('app started...');
    var el = document.getElementById('items');
    sortable = new Sortable(el, {
      animation:150,
      onEnd: function (/**Event*/evt) {
        relabel_ranks();
        var itemEl = evt.item;  // dragged HTMLElement
        evt.to;    // target list
        evt.from;  // previous list
        evt.oldIndex;  // element's old index within old parent
        evt.newIndex;  // element's new index within new parent
        evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
        evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
        evt.clone // the clone element
        evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
  },

    });
}

function relabel_ranks() {
  console.log('relabelling');
  let movie_rank_nodes = document.querySelectorAll('#items .rank-emblem');
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
  
  post_ranks(ranks);
}

const HOST = '192.168.1.171'
const api_endpoint = '/api/vote'

function post_ranks(ranks) {
  console.log(ranks);
  let container = document.querySelector('#items');
  let user_id = container.attributes.user.value;
  
  let url = api_endpoint + `?user_id=${user_id}`;
  ajax_post(url, ranks, ajax_request_done);
}

/*
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
    console.log('ajax request finished');
    console.log(data);
}
*/
