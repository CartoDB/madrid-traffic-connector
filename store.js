var CartoDB = require('cartodb');
var config = require('./config');

module.exports.query = (q) => {
  let p = new Promise((resolve, reject) => {
    let sql = new CartoDB.SQL({
      user: config.CARTO.USERNAME,
      api_key: config.CARTO.API_KEY,
      sql_api_url: `https://${config.CARTO.USERNAME}.carto.com/api/v2/sql`
    });
    sql.execute(q)
      .done(d => {
        resolve();
      })
      .error((error) => {
        console.error(error);
        reject(new Error(`Cannot save data into CARTO: ${error}`));
      });
  });
  return p;
};
