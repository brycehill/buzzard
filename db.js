var r = require('rethinkdb')

module.exports = {
  connect: r.connect({ db: 'buzzard', host: 'localhost', port: 28015 })
}
