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
        resolve(d);
      })
      .error((error) => {
        console.error(error);
        reject(new Error(`Cannot save data into CARTO: ${error}`));
      });
  });
  return p;
};

module.exports.uploadData = (url, table_name, collision_strategy, privacy) => {
  let p = new Promise((resolve, reject) => {
    let importer = new CartoDB.Import({
      user: config.CARTO.USERNAME,
      api_key: config.CARTO.API_KEY
    });
    let options = {
      table_name: table_name,
      collision_strategy: collision_strategy || 'overwrite',
      privacy: privacy || 'link'
    };
    importer.url(url, options)
      .done(table_name => {
        resolve(table_name);
      })
      .error((error) => {
        console.error(error);
        reject(new Error(`Cannot save data into CARTO: ${error}`));
      });
  });
  return p;
};
