--INCIDENCES
CREATE TABLE madrid_traffic_incidences(
  id varchar(64) primary key,
  the_geom geometry(Point,4326),
  type varchar(16),
  description text,
  start timestamp,
  finish timestamp,
  created_at timestamp DEFAULT NOW()
);
SELECT cdb_cartodbfytable('madrid_traffic_incidences');
CREATE INDEX madrid_traffic_incidences_start_idx ON madrid_traffic_incidences(start);
CREATE INDEX madrid_traffic_incidences_finish_idx ON madrid_traffic_incidences(finish);
CREATE INDEX madrid_traffic_incidences_type_idx ON madrid_traffic_incidences(type);
ALTER TABLE madrid_traffic_incidences ADD CONSTRAINT madrid_traffic_incidences_id_unique UNIQUE (id);

--SERVICE LEVELS
CREATE TABLE madrid_traffic_servicelevels(
  id serial,
  the_geom geometry(LineString,4326),
  status varchar(16),
  created_at timestamp DEFAULT NOW()
);
SELECT cdb_cartodbfytable('madrid_traffic_servicelevels');

--INTENSITY POIS
CREATE TABLE madrid_traffic_intensity_pois(
  id serial,
  code varchar(32),
  intensity integer,
  occupancy integer,
  load integer,
  service_level integer,
  speed integer,
  created_at timestamp DEFAULT NOW()
);
CREATE INDEX madrid_traffic_intensity_pois_idx ON madrid_traffic_intensity_pois(code);

--INTENSITY LINES
CREATE TABLE madrid_traffic_intensity_lines(
  id serial,
  the_geom geometry(LineString,4326),
  intensity integer,
  created_at timestamp DEFAULT NOW()
);
SELECT cdb_cartodbfytable('madrid_traffic_intensity_lines');
