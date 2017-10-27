var CartoDB = require('cartodb');
var config = require('./config');

function buildSQL(data) {
  let q = [];
  for (let d of data) {
    q.push(`INSERT INTO ${config.CARTO.TABLE}
              (id,the_geom,type,subtype,description,start,finish)
            VALUES ('${d.id}',${d.the_geom},'${d.type}','${d.subtype}','${d.description}','${d.start}','${d.finish}')
            ON CONFLICT DO NOTHING;`);
  }
  return q.join(' ');
}

module.exports.save = (data) => {
  let p = new Promise((resolve, reject) => {
    let sql = new CartoDB.SQL({user: config.CARTO.USERNAME, api_key: config.CARTO.API_KEY});
    let q = buildSQL(data);
    sql.execute(q)
      .done(d => resolve())
      .error((error) => {
        console.error(error);
        reject(new Error(`Cannot save data into CARTO: ${error}`));
      });
  });
  return p;
}
