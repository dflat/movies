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
