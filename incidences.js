var config = require('./config');
var request = require('request');
var parseString = require('xml2js').parseString;
var hash = require('object-hash');
var store = require('./store');

class Incidences {
  run () {
    let p = new Promise((resolve, reject) => {
      request(config.INCIDENCES.URL, (error, response, body) => {
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
  styleToType (id) {
    switch (id) {
      case '1':
        return 'CONSTRUCTION';
      case '2':
        return 'ACCIDENT';
      case '3':
        return 'ALERT';
      case '4':
        return 'EVENT';
      case '5':
        return 'PREVISION';
    }
  }

  toSQLDate (date) {
    let re = /\d+/g;
    date = date.match(re);
    return `${date[2]}-${date[1]}-${date[0]} ${date[3]}:${date[4]}`;
  }

  parse (xml) {
    let p = new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) return reject(err);
        let incidences = result.Incidencias.Incidencia;
        let data = [];
        for (let incd of incidences) {
          try {
            if (incd.es_contaminacion[0] === 'N') {
              let coord = [incd.longitud[0], incd.latitud[0]]
              let type = this.styleToType(incd.tipoincid[0]);
              let desc = incd.descripcion[0]
              let start = incd.fh_inicio[0]
              let finish = incd.fh_final[0]

              let o = {
                the_geom: `ST_SetSRID(ST_MakePoint(${coord}),4326)`,
                type: type,
                description: desc,
                start: start,
                finish: finish
              };

              o['id'] = hash(o);
              data.push(o);
            }
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
    let q = [];
    for (let d of data) {
      q.push(`INSERT INTO ${config.INCIDENCES.TABLE}
                (id,the_geom,type,description,start,finish)
              VALUES ('${d.id}',${d.the_geom},'${d.type}','${d.description}','${d.start}','${d.finish}')
              ON CONFLICT DO NOTHING;`);
    }

    return q.join(' ');
  }
}

module.exports = Incidences;
