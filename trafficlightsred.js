const config = require('./config');
const store = require('./store');

class TrafficLightsRed {
  run() {
    let p = new Promise((resolve, reject) => {
      store.uploadData(config.TRAFF_LIGHTS_RED.URL,
        config.TRAFF_LIGHTS_RED.TABLE, 'overwrite')
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
    return `
      BEGIN;
      DELETE FROM ${config.TRAFF_LIGHTS_RED.TABLE};
      INSERT INTO ${config.TRAFF_LIGHTS_RED.TABLE}
        SELECT * FROM ${data};
      UPDATE ${config.TRAFF_LIGHTS_RED.TABLE} SET
        created_at = now();
      DROP TABLE IF EXISTS ${data};
      COMMIT;
    `;
  }
}

module.exports = TrafficLightsRed;
