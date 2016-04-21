var r = require('rethinkdb')
var conn;
require('../db.js').connect.then( (c) => conn = c )

module.exports = {

  get: function(word) {
    return r.table('words')
      .getAll(word, { index: 'word' })
      .run(conn)
  },

  getAll: function(ordered) {
    return r.table('words')
      .orderBy(ordered)
      .run(conn)
  },

  insert: function(w) {
    return r.table('words').insert(w).run(conn)
  },

  update: function(w) {
    return r.table('words').update(w).run(conn)
  }

}
