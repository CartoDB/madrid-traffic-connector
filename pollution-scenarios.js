const config = require('./config');
const request = require('request');
const parseString = require('xml2js').parseString;
const store = require('./store');

class PollutionScenarios {
  run () {
    let p = new Promise((resolve, reject) => {
      request(config.POLLUTION_SCENARIOS.URL, (error, response, body) => {
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
            // Only perform the query when there is data available
            if (data.length) {
              store.query(this.buildSQL(data))
              .then(d => resolve())
              .catch(e => reject(e));
            } else {
              resolve();
            }
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
        let scenario = result.PermisosContaminacion.Permiso;
        let data = [];
        for (let scn of scenario) {
          try {
            data.push({
              codigo: scn.codigo[0],
              fecha: scn.fecha[0],
              descripcion: scn.descripcion[0],
            });
          } catch (err) {
            // Catch exception to avoid abort all the features
            console.error('Error parsing element');
          }
        }

        resolve(data);
      });
    });
    return p;
  }

  buildSQL (data) {
    const q = [];
    for (let d of data) {
      q.push(
        `
        INSERT INTO ${config.POLLUTION_SCENARIOS.TABLE}
        (
          codigo,
          fecha,
          descripcion,
          created_at
        )
        VALUES (
          ${d.codigo},
          '${d.fecha}',
          '${d.descripcion}',
          now()
        )
        ON CONFLICT DO NOTHING;`
      );
    }

    return `
      BEGIN;
      DELETE FROM ${config.POLLUTION_SCENARIOS.TABLE};
      ${q.join(' ')}
      COMMIT;
    `;
  }
}

module.exports = PollutionScenarios;
