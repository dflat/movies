document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

var sortable;
function init() {
    console.log('vote.js started...');

    get_lock_status();

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
    add_lock_listener();
    // cached_ranks variable is set from server in flask template script (top of vote.html)
    console.log(cached_ranks)
    if (cached_ranks.length) { // check if any ranks have been cached before attempting to restore sort
      sortable.sort(cached_ranks, false) // false means do not animate
      relabel_ranks(post=false);
    }

}

function add_lock_listener() {
  let node = document.getElementById('lock-btn')
  attach_listener(node, 'click', lock_in_vote);
}

const PASSWORD = 'ullab'
var locked_in = false;
function lock_in_vote() {
  let container = document.querySelector('#items');
  let user_id = container.attributes.user.value;
  
  let path;
  if (locked_in == false) {
    path = '/lock';
    set_vote_lock_status(true)
  }
  else {
    let pw = prompt("Enter password:");
    if (pw.toLowerCase().trim() != PASSWORD)
      return;
    path = '/unlock';
    set_vote_lock_status(false)
  }

  //locked_in = !locked_in;
  //this.classList.toggle('locked-in');
  //this.classList.toggle('unlocked');

  let url = api_endpoint  + path + `?user_id=${user_id}`;
  ajax_request(url, ajax_request_done);
}

function get_lock_status() {
  let container = document.querySelector('#items');
  let user_id = container.attributes.user.value;

  let url = api_endpoint  + '/status' + `?user_id=${user_id}`;
  callback = (data) => {
    console.log('RESP:', data.response);
    set_vote_lock_status(JSON.parse(data.response));
  }
  ajax_request(url, callback);
}

function set_vote_lock_status(status) {
    console.log('lock status:', status)
    let node = document.getElementById('lock-btn')
    sortable.options.disabled = status;
    locked_in = status;
    if (status==true) {
      node.classList.add('locked-in')
      node.classList.remove('unlocked')
    }
    if (status==false) {
      node.classList.add('unlocked')
      node.classList.remove('locked-in')
    }
}

function relabel_ranks(post=true) {
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
  
  if (post)
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


