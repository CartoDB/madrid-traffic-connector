const config = require('./config');
const store = require('./store');

class Cameras {
  run() {
    let p = new Promise((resolve, reject) => {
      store.uploadData(config.CAMERAS.URL,
        config.CAMERAS.TABLE, 'overwrite')
        .then(data => {
          store.query(this.buildSQL(data))
          .then(d => resolve())
          .catch(e => reject(e));
        })
        .catch(e => reject(e));
    });
    return p;
  }

  buildSQL (data) {
    return `BEGIN;
            DROP TABLE IF EXISTS ${config.CAMERAS.TABLE};
            ALTER TABLE ${data} RENAME TO ${config.CAMERAS.TABLE};
            DROP TABLE IF EXISTS ${data};
            COMMIT;
            `;
  }
}

module.exports = Cameras;
