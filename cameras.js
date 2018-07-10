const config = require('./config');
const request = require('request');
const parseString = require('xml2js').parseString;
const store = require('./store');

class Cameras {
  run() {
    let p = new Promise((resolve, reject) => {
      request(config.CAMERAS.URL, (error, response, body) => {
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

  parse (xml) {
    let p = new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        let doc = result.kml.Document[0];
        let placeMarks = doc.Placemark;
        let data = [];
        for (let p of placeMarks) {
          try {
            const cod_id = p.ExtendedData[0].Data[0].Value[0];
            const name = p.ExtendedData[0].Data[1].Value[0].replace("'","\\'");
            const coords = p.Point[0].coordinates[0];
            const url = `${config.CAMERAS.URL_IMAGES}Camara${cod_id}.jpg`;
            let o = {
              the_geom: `ST_Force_2D(ST_SetSRID(
                          ST_GeomFromKML('<Point><coordinates>${coords}</coordinates></Point>')
                        ,4326))`,
              name: name,
              cod_id: cod_id,
              url: url
            };
            data.push(o);
          } catch (err) {
            // Catch exception to avoid abort all the features
            console.error(`Error parsing element: ${err}`);
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
          INSERT INTO ${config.CAMERAS.TABLE}
            (the_geom, name, cod_id, url, created_at)
            VALUES
            (${d.the_geom},E'${d.name}','${d.cod_id}','${d.url}',now());
        `);
    }
    return `BEGIN;
            DELETE FROM ${config.CAMERAS.TABLE};
            ${q.join(' ')}
            COMMIT;
            `;
  }
}

module.exports = Cameras;
