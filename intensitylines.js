const config = require('./config');
const request = require('request');
const parseString = require('xml2js').parseString;
const store = require('./store');

class IntensityLines {
  run () {
    let p = new Promise((resolve, reject) => {
      request(config.INTENSITY.LINES_URL, (error, response, body) => {
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
  styleToIntensity (value) {
    /*
    Intensity ranges (veh/h) and categories:
      0-100: 1
      100-500: 2
      500-1000: 3
      1000-2000: 4
      2000-3000:  5
      3000-5000: 6
      5000-10000: 9
      No data: 7 and 8
    */
    switch (value) {
      case 'Color1':
        return 1;
      case 'Color2':
        return 2;
      case 'Color3':
        return 3;
      case 'Color4':
        return 4;
      case 'Color5':
        return 5;
      case 'Color6':
        return 6;
      case 'Color7':
        return 7;
      case 'Color8':
        return 8;
      case 'Color9':
        return 9;
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
            const intensity = this.styleToIntensity(p.styleUrl[0].substring(1));
            const coords = p.LineString[0].coordinates[0];
            let o = {
              the_geom: `ST_Force2D(ST_SetSRID(
                          ST_GeomFromKML('<LineString><coordinates>${coords}</coordinates></LineString>')
                        ,4326))`,
              intensity: intensity
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
          INSERT INTO ${config.INTENSITY.LINES_TABLE}
                (the_geom, intensity, created_at)
              VALUES (${d.the_geom},${d.intensity},now());
        `);
    }

    return `BEGIN;
            DELETE FROM ${config.INTENSITY.LINES_TABLE};
            ${q.join(' ')}
            COMMIT;
            `;
  }
}

module.exports = IntensityLines;
