const { Pool } = require('pg')
const pool = new Pool()

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
  })

 pool.connect( (err , connection) => {
      if (err) throw err;
      console.log('Database is connected successfully !');
      connection.release();
    });

module.exports = {
  query: (text, params) => pool.query(text, params)
}
