const config = require('./config');
const request = require('request');
const parseString = require('xml2js').parseString;
const store = require('./store');

class ServiceLevel {
  run () {
    let p = new Promise((resolve, reject) => {
      // fs.readFile('tramos.kml', (err, data) => {
      //   if (err) throw err;
      //   this.parse(data).then(data => {
      //     // console.log(this.buildSQL(data));
      //     // resolve();
      //     store.query(this.buildSQL(data))
      //       .then(d => resolve())
      //       .catch(e => reject(e));
      //   }).catch(reason => {
      //     let e = new Error(`Error parsing KML: ${reason}`);
      //     console.error(e);
      //     reject(e);
      //   });
      // });
      request(config.SERVICE_LEVEL.URL, (error, response, body) => {
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
          this.parse(body).then((data) => {
            store.query(this.buildSQL(data))
              .then(d => resolve())
              .catch(e => reject(e));
          }).catch(reason => {
            let e = new Error(`Error parsing KML: ${reason}`);
            console.error(e);
            reject(e);
          });
        }
      });
    });
    return p;
  }
  styleToStatus (status) {
    switch (status) {
      case 'Verde':
        return 'FLUID';
      case 'Rojo':
        return 'CONGESTION';
      case 'Morado':
        return 'NODATA';
      case 'Amarillo':
        return 'SLOW';
      case 'Naranja':
        return 'HOLD';
      case 'Negro':
        return 'CLOSED';
    }
  }

  parse (xml) {
    let p = new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        let doc = result.kml.Document[0];
        let placeMarks = doc.Placemark;
        let data = [];
        for (let p of placeMarks) {
          try {
            const status = this.styleToStatus(p.styleUrl[0].substring(1));
            const coords = p.LineString[0].coordinates[0];
            let o = {
              the_geom: `ST_Force_2D(ST_SetSRID(
                          ST_GeomFromKML('<LineString><coordinates>${coords}</coordinates></LineString>')
                        ,4326))`,
              status: status
            };

            data.push(o);
          } catch (err) {
            // Catch exception to avoid abort all the features
            console.error('Error parsing element');
          }
        }

        if (!data.length) {
          reject(new Error('No length after parser'));
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
          INSERT INTO ${config.SERVICE_LEVEL.TABLE}
                (the_geom,status,created_at)
              VALUES (${d.the_geom},'${d.status}',now());
        `);
    }

    return `BEGIN;
            DELETE FROM ${config.SERVICE_LEVEL.TABLE};
            ${q.join(' ')}
            COMMIT;
            `;
  }
}

module.exports = ServiceLevel;
