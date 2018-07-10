const Cameras = require('./cameras');

const r = new Cameras();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
