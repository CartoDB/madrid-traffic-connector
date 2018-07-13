'use strict';

function run (Obj, event, context, callback) {
  let r = new Obj();
  r.run().then(d => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Connector executed successfully!',
        input: event
      })
    };
    callback(null, response);
  })
  .catch(err => {
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: `Something went wrong: ${err}`,
        input: event
      })
    };
    callback(err, response);
  });
}

module.exports.incidences = (event, context, callback) => {
  run(require('incidences'), event, context, callback);
};

module.exports.servicelevel = (event, context, callback) => {
  run(require('servicelevel'), event, context, callback);
};

module.exports.intensitypois = (event, context, callback) => {
  run(require('intensitypois'), event, context, callback);
};

module.exports.intensitylines = (event, context, callback) => {
  run(require('intensitylines'), event, context, callback);
};

module.exports.trafficlightsacustw = (event, context, callback) => {
  run(require('trafficlightsacustw'), event, context, callback);
};

module.exports.trafficlightsred = (event, context, callback) => {
  run(require('trafficlightsred'), event, context, callback);
};

module.exports.cameras = (event, context, callback) => {
  run(require('cameras'), event, context, callback);
};
