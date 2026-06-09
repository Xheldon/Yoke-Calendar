/* Light/dark toggle. Default is light (set inline in <head> to avoid a flash);
   here we just flip + remember the choice when the nav button is clicked. */
(function () {
  var root = document.documentElement
  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#theme-toggle')) return
    var next = current() === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    try {
      localStorage.setItem('yoke-theme', next)
    } catch (_) {}
  })
})()
