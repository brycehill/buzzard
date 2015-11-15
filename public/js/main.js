var socket = io()

var form = document.querySelector('#word-form')
form.addEventListener('submit', function(e) {
  var data = { word: this.word.value };
  e.preventDefault();
  socket.emit('word added', data)
})

socket.on('word added', function(word) {
  var list = document.querySelector('#word-list');
  var li = document.createElement('li')
  li.textContent = word.word + ' ('+word.count+')'
  list.appendChild(li);
  form.reset()
})

socket.on('word updated', function(word) {
  var lis = document.querySelectorAll('#word-list li')
  var li = [].filter.call(lis, function(el) { return el.dataset.id == word.word })[0]
  li.textContent = word.word + ' (' + word.count + ')'
  form.reset()
})
