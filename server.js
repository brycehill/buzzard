var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var r = require('rethinkdb')

var connection = null;
r.connect( { db: 'buzzard', host: 'localhost', port: 28015}, function(err, conn) {
  if (err) throw err
  connection = conn

  r.table('words').changes().run(connection, function(err, cursor) {
    cursor.each(function(err, changes) {
      if (!changes.old_val) {
        io.emit('word added', changes.new_val)
      } else {
        io.emit('word updated', changes.new_val)
      }
    })
  })
})

app.use(express.static('public'))
app.set('views', './views')
app.set('view engine', 'jade')

app.get('/', function (req, res) {
  var words = []

  r.table('words')
    .run(connection)
    .then(function(cursor) {
      cursor.toArray()
        .then(function(result) {
          res.render('index', { words: result })
        })
    })
})

io.on('connection', function(socket) {
  socket.on('word added', function(data) {
    var table = r.table('words');
    table.getAll(data.word, { index: 'word' })
      .run(connection)
      .then(function(words) {
        words.toArray().then(function(words) {
          var word = {}
          if (!words.length) {
              word = { word: data.word, count: 1 }
              table.insert(word)
                .run(connection)
            } else {
              word = words[0]
              word.count++
              table.update(word).run(connection)
            }
        })
      })
  })
})


http.listen(3000, function(){
  console.log('listening on *:3000')
})
