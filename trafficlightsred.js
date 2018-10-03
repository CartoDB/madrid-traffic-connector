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
    return `BEGIN;
            DROP TABLE IF EXISTS ${config.TRAFF_LIGHTS_RED.TABLE};
            ALTER TABLE ${data} RENAME TO ${config.TRAFF_LIGHTS_RED.TABLE};
            DROP TABLE IF EXISTS ${data};
            UPDATE ${config.TRAFF_LIGHTS_RED.TABLE}
              SET the_geom = ST_Transform(ST_SetSRID(the_geom, 25830), 4326);
            GRANT SELECT ON ${config.TRAFF_LIGHTS_RED.TABLE} TO publicuser;
            COMMIT;
            `;
  }
}

module.exports = TrafficLightsRed;
