const config = require('./config');
const request = require('request');
const parseString = require('xml2js').parseString;
const store = require('./store');

class PollutionIncidences {
  run () {
    let p = new Promise((resolve, reject) => {
      request(config.POLLUTION.URL, (error, response, body) => {
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
        let incidences = result.Incidencias.Incidencia;
        let data = [];
        for (let incd of incidences) {
          try {
            if (incd.es_contaminacion[0] === 'S') {
              const id = incd.id_incidencia[0];
              const level = incd.escenario_contaminacion[0];
              const description = incd.descripcion_escenario[0];
              const measures = incd.medidas_escenario[0];
              const exceptions = incd.excepciones_escenario[0];
              const start = incd.fh_inicio[0] ? `'${incd.fh_inicio[0]}'`: "NULL";
              const finish = incd.fh_final[0] ? `'${incd.fh_final[0]}'`: "NULL";

              let o = {
                id: id,
                level: level,
                description: description,
                measures: measures,
                exceptions: exceptions,
                start: start,
                finish: finish
              };

              data.push(o);
            }
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
        INSERT INTO ${config.POLLUTION.TABLE}
        (
          id,
          level,
          description,
          measures,
          exceptions,
          start,
          finish,
          created_at
        )
        VALUES (
          ${d.id},
          '${d.level}',
          '${d.description}',
          '${d.measures}',
          '${d.exceptions}',
          ${d.start},
          ${d.finish},
          now()
        )
        ON CONFLICT DO NOTHING;`
      );
    }

    return `
      BEGIN;
      DELETE FROM ${config.POLLUTION.TABLE};
      ${q.join(' ')}
      COMMIT;
    `;
  }
}

module.exports = PollutionIncidences;
