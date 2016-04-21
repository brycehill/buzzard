var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var r = require('rethinkdb')
var words = require('./models/words')

app.use(express.static('public'))
app.set('views', './views')
app.set('view engine', 'jade')

require('./db.js').connect.then( (c) => {
  // @todo move this out
  r.table('words').changes().run(c, function(err, cursor) {
    cursor.each(function(err, changes) {
      if (!changes.old_val) {
        io.emit('word added', changes.new_val)
      } else {
        io.emit('word updated', changes.new_val)
      }
    })
  })
})

app.get('/', function (req, res) {
  words.getAll(r.desc('updated'))
    .then(function(cursor) {
      cursor.toArray()
        .then(function(result) {
          res.render('index', { words: result })
        })
    })
})

io.on('connection', function(socket) {
  socket.on('word added', function(data) {
    words.get(data.word)
      .then(function(cursor) {
        cursor.toArray().then(function(res) {
          var word = {}
          if (!res.length) {
              word = { word: data.word, count: 1, updated: new Date() }
              words.insert(word)
            } else {
              word = res[0]
              word.count++
              word.updated = new Date()
              words.update(word)
            }
        })
      })
  })
})


http.listen(3000, function(){
  console.log('listening on *:3000')
})
