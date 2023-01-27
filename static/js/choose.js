document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

function init() {
  let users = document.querySelectorAll('.user-button');
  users.forEach(u => {
    attach_listener(u, 'click', choose_user)
  })
}

function choose_user(evt) {
  console.log(evt)
  evt.preventDefault();
  let url = this.attributes.href.value;
  console.log(url)
  //alert(url)
  //location.reload();
  //location.assign(url);
  location.href = url;
}