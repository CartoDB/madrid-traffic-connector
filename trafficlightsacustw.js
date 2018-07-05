const config = require('./config');
const store = require('./store');

class TrafficLightsAcustW {
  run() {
    let p = new Promise((resolve, reject) => {
      store.uploadData(config.TRAFF_LIGHTS_ACUSTW.URL,
        config.TRAFF_LIGHTS_ACUSTW.TABLE, 'overwrite')
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
            DROP TABLE IF EXISTS ${config.TRAFF_LIGHTS_ACUSTW.TABLE};
            ALTER TABLE ${data} RENAME TO ${config.TRAFF_LIGHTS_ACUSTW.TABLE};
            DROP TABLE IF EXISTS ${data};
            COMMIT;
            `;
  }
}

module.exports = TrafficLightsAcustW;
