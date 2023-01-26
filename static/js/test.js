document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

function attach_listener(node, event_type, func) {
  node.addEventListener(event_type, func);
}

var sortable;
function init() {
    console.log('test started...');

    var el = document.getElementById('items');
	    sortable = new Sortable(el, {
      animation:550,
      disabled:true, /* don't allow user to drag order, controlled by server */
	});

  let node = document.getElementById('items')
  attach_listener(node, 'click', flip)

}

function flip(){
  console.log('flipping')
  sortable.sort(sortable.toArray().reverse(), true);
}
