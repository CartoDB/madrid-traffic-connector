module.exports = {
  URL: 'http://datos.madrid.es/egob/catalogo/208252-0-incidencias-viapublica-mapa.kml',
  CARTO: {
    USERNAME: process.env.USERNAME,
    API_KEY: process.env.API_KEY,
    TABLE: process.env.TABLE || 'madrid_traffic'
  }
}
