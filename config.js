module.exports = {
  INCIDENCES: {
    URL: 'http://datos.madrid.es/egob/catalogo/208252-0-incidencias-viapublica-mapa.kml',
    TABLE: process.env.INCIDENCES_TABLE || 'madrid_traffic_incidences'
  },
  SERVICE_LEVEL: {
    URL: 'http://informo.munimadrid.es/informo/tmadrid/tramos.kml',
    TABLE: process.env.SERVICE_LEVEL_TABLE || 'madrid_traffic_servicelevels'
  },
  INTENSITY: {
    POIS_URL: 'http://informo.munimadrid.es/informo/tmadrid/pm.xml',
    POIS_TABLE: process.env.INTENSITY_POIS_TABLE || 'madrid_traffic_intensity_pois',
    LINES_URL: 'https://datos.madrid.es/egob/catalogo/208223-7605484-trafico-intensidad-tramas.kml',
    LINES_TABLE: process.env.INTENSITY_LINES_TABLE || 'madrid_traffic_intensity_lines'
  },
  TRAFF_LIGHTS_ACUSTW: {
    URL: 'https://datos.madrid.es/egob/catalogo/202539-0-semaforos-avisadores.zip',
    TABLE: process.env.TRAFF_LIGHTS_ACUSTW_TABLE || 'madrid_traffic_tlights_acustw'
  },
  TRAFF_LIGHTS_RED: {
    URL: 'https://datos.madrid.es/egob/catalogo/205193-0-semaforos-foto-rojo.zip',
    TABLE: process.env.TRAFF_LIGHTS_RED_TABLE || 'madrid_traffic_tlights_red'
  },
  CAMERAS: {
    URL: 'http://informo.munimadrid.es/informo/tmadrid/CCTV.KML',
    TABLE: process.env.CAMERAS_TABLE || 'madrid_traffic_cameras',
    URL_IMAGES: '/cameras/'
  },
  POLLUTION: {
    // TODO: Add correct data source URL
    URL: '',
    TABLE: process.env.POLLUTION_INCIDENCES_TABLE || 'madrid_traffic_pollution_incidences'
  },
  CARTO: {
    USERNAME: process.env.CARTO_USERNAME,
    API_KEY: process.env.CARTO_API_KEY
  },
  WAZE: {
    GEOCODER_URL: 'https://feed.world.waze.com/FeedManager/getStreet',
    GEOCODER_TOKEN: process.env.WAZE_GEOCODER_TOKEN
  }
};
