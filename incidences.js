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
      case '0':
        return 'CONSTRUCTION';
      case '1':
        return 'ACCIDENT';
      case '2':
        return 'ALERT';
      case '3':
        return 'EVENT';
      case '4':
        return 'PREVISION';
    }
  }

  toSQLDate (date) {
    let re = /\d+/g;
    date = date.match(re);
    return `${date[2]}-${date[1]}-${date[0]} ${date[3]}:${date[4]}`;
  }

  parseDesc (desc) {
    let cleanInput = desc.replace(/<\/?\w+>/g, '');
    let match = cleanInput.match(/\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}/g);
    return {
      start: this.toSQLDate(match[0]),
      finish: this.toSQLDate(match[1]),
      desc: cleanInput.replace(/\.?\s?\[(Inicio|Final):[\s\d/:]+\]/ig, '')
    };
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
            let coord = p.Point[0].coordinates[0].split(',').slice(0, 2);
            let type = this.styleToType(p.styleUrl[0].slice(-1));
            let parseDesc = this.parseDesc(p.description[0]);
            let o = {
              the_geom: `ST_SetSRID(ST_MakePoint(${coord}),4326)`,
              type: type,
              description: parseDesc.desc,
              start: parseDesc.start,
              finish: parseDesc.finish
            };

            o['id'] = hash(o);
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
