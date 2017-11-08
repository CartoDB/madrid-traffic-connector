const ServiceLevel = require('./servicelevel');

const r = new ServiceLevel();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
