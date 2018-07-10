const IntensityLines = require('./intensitylines');

const r = new IntensityLines();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
