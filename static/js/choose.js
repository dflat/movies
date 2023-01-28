document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    init();
  }
}

function init() {
  hide_loader()
  let users = document.querySelectorAll('.user-button');
  users.forEach(u => {
    attach_listener(u, 'click', choose_user)
  })
}

function choose_user(evt) {
  console.log(evt)
  evt.preventDefault();
  //this.classList.add('chosen-user')
  show_loader()
  let url = this.attributes.href.value;
  console.log(url)
  setTimeout(hide_loader, 1000)
  location.href = url;
}