const TrafficLightsAcustW = require('./trafficlightsacustw');

const r = new TrafficLightsAcustW();
r.run().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error(err);
});
