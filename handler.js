'use strict';
let Reader = require('./reader');

module.exports.run = (event, context, callback) => {

  let r = new Reader();
  r.run().then( d => {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Connector executed successfully!',
        input: event,
      })
    };
    callback(null, response);
  })
  .catch(err => {
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: `Something went wrong: ${err}`,
        input: event,
      })
    };
    callback(err, response);
  });
};
