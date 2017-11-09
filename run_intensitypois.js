const IntensityPois = require('./intensitypois');
const r = new IntensityPois();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
