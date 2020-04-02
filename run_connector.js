const Cameras = require('./cameras');
const Incidences = require('./incidences');
const IntensityLines = require('./intensitylines');
const IntensityPois = require('./intensitypois');
const ServiceLevel = require('./servicelevel');
const TrafficLightsAcustW = require('./trafficlightsacustw');
const TrafficLightsRed = require('./trafficlightsred');
const StreetsGeocoder = require('./streetsgeocoder');
const PollutionIncidences = require('./pollutionIncidences');
const PollutionScenarios = require('./pollution-scenarios');
const argv = require('minimist')(process.argv.slice(2));


function getTrafficConnector(connector) {
  switch (connector) {
    case 'cameras':
      return new Cameras();
    case 'incidences':
      return new Incidences();
    case 'intensitylines':
      return new IntensityLines();
    case 'intensitypois':
      return new IntensityPois();
    case 'servicelevel':
      return new ServiceLevel();
    case 'trafficlightsacustw':
      return new TrafficLightsAcustW();
    case 'trafficlightsred':
      return new TrafficLightsRed();
    case 'streetsgeocoder':
      return new StreetsGeocoder();
    case 'pollutionincidences':
      return new PollutionIncidences();
    case 'pollutionscenarios':
      return new PollutionScenarios();
    default:
      console.error('You must use a valid connector...');
      process.exit();
  }
}

const conn = getTrafficConnector(argv.c);
conn.run().then(() => {
  console.log(`Completed (${argv.c})`);
}).catch(err => {
  console.error(err);
});
