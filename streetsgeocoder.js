var config = require('./config');
var request = require('request-promise-native');
var store = require('./store');

class StreetsGeocoder {
  run () {
    let p = new Promise((resolve, reject) => {
      this.getGeomsToGeocode()
        .then((data) => {
          this.getWazeData(data)
            .then((stgeocod) => {
              console.log(this.buildSQL(stgeocod));
              store.query(this.buildSQL(stgeocod))
                .then(d => resolve())
                .catch(e => reject(e));
            })
            .catch((err) => {
              console.log(err);
            });
          })
        .catch((err) => {
          console.log(err);
        });
      });
    return p;
  }

  getWazeData(data) {
    let p = new Promise((resolve, reject) => {
      let params;
      let prs = [];
      for (const d of data.rows){
        params = {
          'token': config.WAZE.GEOCODER_TOKEN,
          'lat': d.lat,
          'lon': d.lon
        };
        let pr = request.get({
          url: config.WAZE.GEOCODER_URL,
          qs: params
        });
        prs.push(pr.then((resp) => {
          return {
            body: JSON.parse(resp),
            cartodb_id: d.cartodb_id
          }
        })
        .catch(err => {return err}));
      }
      Promise.all(prs).then((resp) => {
        let stgeocod = [];
        for (const r of resp){
          for (const st of r.body.result){
            if (st.names[0] != ''){
              stgeocod.push({
                stname: st.names[0],
                cartodb_id: r.cartodb_id
              });
              break;
            }
          }
        }
        if (!stgeocod.length) {
          reject(new Error('No length after parser'));
        }
        resolve(stgeocod);
      })
      .catch((err) => {
        console.log(err);
      });
    });
    return p;
  }

  getGeomsToGeocode() {
    const q = `
      SELECT cartodb_id, ST_X(the_geom) as lon, ST_Y(the_geom) as lat
      FROM ${config.INCIDENCES.TABLE}
      WHERE finish::timestamp >= NOW()::timestamp AND street IS NULL
    `;
    return store.query(q);
  }

  buildSQL (data) {
    let q = [];
    console.log('@@@@@@@@@@@', data);
    for (let d of data) {
      q.push(`UPDATE ${config.INCIDENCES.TABLE}
                  SET street = E'${d.stname.replace(/'/g, "\\'")}'
              WHERE cartodb_id = ${d.cartodb_id};
              `);
    }
    return q.join(' ');
  }
}

module.exports = StreetsGeocoder;
