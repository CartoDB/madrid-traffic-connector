var config = require('./config');
var request = require('request');
var parseString = require('xml2js').parseString;
var hash = require('object-hash');
var store = require('./store');

class Reader {
  constructor() { }

  run() {
    let p = new Promise((resolve, reject) => {
      request(config.URL, (error, response, body) => {
        if (error){
          console.error('error:', error); // Print the error if one occurred
          reject(error);
        }
        else if (!response){
          let e = new Error('No response received');
          console.error(e);
          reject(e);
        }
        else if (response.statusCode != 200) {
          let e = new Error(`Unexpected statusCode: ${response.statusCode}`);
          console.error(e);
          reject(e);
        }
        else if (!response.body) {
          let e = new Error(`Missing body`);
          console.error(e);
          reject(e);
        }
        else {
          this.parse(body).then((data) => {
            store.save(data)
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

  styleToCategory(id) {
    switch (id) {
      case '0':
        return {
          type: 'CONSTRUCTION',
          subtype: null
        };
      case '1':
        return {
          type: 'ACCIDENT',
          subtype: null
        };
      case '2':
        return {
          type: 'MISC',
          subtype: 'MAJOR'
        };

      case '3':
        return {
          type: 'MISC',
          subtype: 'MODERATE'
        };

      case '4':
        return {
          type: 'MISC',
          subtype: 'LOW'
        };
    }
  }

  toSQLDate(date) {
    let re = /\d+/g;
    date = date.match(re);
    return `${date[2]}-${date[1]}-${date[0]} ${date[3]}:${date[4]}`;
  }

  parseDesc(desc) {
    let cleanInput = desc.replace(/<\/?\w+>/g,'');
    let match = cleanInput.match(/\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}/g);
    return {
      start: this.toSQLDate(match[0]),
      finish: this.toSQLDate(match[1]),
      desc: cleanInput.replace(/\.?\s?\[(Inicio|Final):[\s\d\/\:]+\]/ig,'')
    }
  }

  parse(xml) {
    let p = new Promise((resolve, reject) => {
      parseString(xml,  (err, result) => {
        if (err) return reject(err);
        let doc = result.kml.Document[0];
        let placeMarks = doc.Placemark;
        let data = [];
        for (let p of placeMarks) {
          try {
            let coord = p.Point[0].coordinates[0].split(',').slice(0,2);
            let style = this.styleToCategory(p.styleUrl[0].slice(-1));
            let parseDesc = this.parseDesc(p.description[0]);
            let o = {
              the_geom: `ST_SetSRID(ST_MakePoint(${coord}),4326)`,
              type: style.type,
              subtype: style.subtype,
              description: parseDesc.desc,
              start: parseDesc.start,
              finish: parseDesc.finish
            };

            o['id'] = hash(o);
            data.push(o);
          }
          catch(err){
            // Catch exception to avoid abort all the features
            console.error('Error parsing element');
          }
        }

        if (!data.length){
          reject(new Error('No length after parser'));
        }
        resolve(data);
      });
    });
    return p;
  }

}

module.exports = Reader;
