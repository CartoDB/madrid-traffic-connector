const TrafficLightsRed = require('./trafficlightsred');

const r = new TrafficLightsRed();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
