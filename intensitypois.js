const config = require('./config');
const request = require('request');
const parseString = require('xml2js').parseString;
const store = require('./store');

class IntensityPois {
  run () {
    let p = new Promise((resolve, reject) => {
      // let body = require('./sampledata');
      //
      // this.parse(body)
      //   .then(data => {
      //     const q = this.buildSQL(data);
      //     //resolve();
      //     //console.log(q);
      //     store.query(q)
      //       .then(d => resolve())
      //       .catch(e => reject(e));
      //   }).catch(reason => {
      //     let e = new Error(`Error parsing XML: ${reason}`);
      //     console.error(e);
      //     reject(e);
      //   });

      request(config.INTENSITY.POIS_URL, (error, response, body) => {
        if (error) {
          console.error('error:', error); // Print the error if one occurred
          reject(error);
        } else if (!response) {
          let e = new Error('No response received');
          console.error(e);
          reject(e);
        } else if (response.statusCode !== 200) {
          let e = new Error(`Unexpected statusCode: ${response.statusCode}`);
          console.error(e);
          reject(e);
        } else if (!response.body) {
          let e = new Error(`Missing body`);
          console.error(e);
          reject(e);
        } else {
          this.parse(body)
            .then((data) => {
              store.query(this.buildSQL(data))
                .then(d => resolve())
                .catch(e => reject(e));
            }).catch(reason => {
              let e = new Error(`Error parsing XML: ${reason}`);
              console.error(e);
              reject(e);
            });
        }
      });
    });
    return p;
  }

  getVar (obj, variable, fnWrapper) {
    if (!fnWrapper) {
      fnWrapper = r => { return r; };
    }
    let r = obj[variable] && obj[variable].length > 0 ? fnWrapper(obj[variable][0]) : null;
    if (isNaN(r) || r === '') {
      r = null;
    }
    return r;
  }

  parse (xml) {
    let p = new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        let pms = result.pms.pm;
        let data = [];
        for (let pm of pms) {
          data.push({
            code: this.getVar(pm, 'codigo'),
            intensity: this.getVar(pm, 'intensidad', parseInt),
            occupancy: this.getVar(pm, 'ocupacion', parseInt),
            load: this.getVar(pm, 'carga', parseInt),
            service_level: this.getVar(pm, 'nivelServicio', parseInt),
            speed: this.getVar(pm, 'velocidad', parseInt)
          });
        }
        resolve(data);
      });
    });
    return p;
  }

  buildSQL (data) {
    const q = [];
    for (let d of data) {
      q.push(`
          INSERT INTO ${config.INTENSITY.POIS_TABLE}
                (code,intensity,occupancy,load,service_level,speed)
              VALUES ('${d.code}',${d.intensity},${d.occupancy},${d.load},${d.service_level},${d.speed});
        `);
    }

    return `BEGIN;
            DELETE FROM ${config.INTENSITY.POIS_TABLE};
            ${q.join(' ')}
            COMMIT;
            `;
  }
}

module.exports = IntensityPois;
