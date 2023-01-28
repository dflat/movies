/* utils.js */
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

function attach_listener(node, event_type, func) {
  node.addEventListener(event_type, func);
}

function center_on_page(node) {
  let y_off = window.scrollY
  let W = window.innerWidth
  let H = window.innerHeight
  let box = node.getBoundingClientRect()
  console.log('box', box)
  console.log('W, H', W, H)
  let top = H/2 - box.height/2 + y_off
  let left = W/2 - box.width/2
  node.style.position = 'absolute'
  node.style.top = top + 'px'
  node.style.left = left + 'px'
}

function show_loader(node) {
  let loader = document.getElementById('loader');
  loader.style.display = 'block'
  center_on_page(loader)
  loader.classList.add('spin')
}
function hide_loader() {
  let loader = document.getElementById('loader');
  loader.style.left = -200 + 'px'
}
