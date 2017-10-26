let Reader = require('./reader');

let r = new Reader();
r.run().then(()=> {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
