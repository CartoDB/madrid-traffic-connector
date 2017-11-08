module.exports = {
  INTENSITY_VALUES_URL: 'http://informo.munimadrid.es/informo/tmadrid/pm.xml',
  INCIDENCES: {
    URL: 'http://datos.madrid.es/egob/catalogo/208252-0-incidencias-viapublica-mapa.kml',
    TABLE: process.env.INCIDENCES_TABLE || 'madrid_traffic_incidences'
  },
  SERVICE_LEVEL: {
    URL: 'http://informo.munimadrid.es/informo/tmadrid/tramos.kml',
    TABLE: process.env.SERVICE_LEVEL_TABLE || 'madrid_traffic_servicelevels'
  },
  CARTO: {
    USERNAME: process.env.CARTO_USERNAME,
    API_KEY: process.env.CARTO_API_KEY
  }
};
