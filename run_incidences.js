const Incidences = require('./incidences');

const r = new Incidences();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
