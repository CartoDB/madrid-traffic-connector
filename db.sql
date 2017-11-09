CREATE TABLE madrid_traffic_incidences(
  id varchar(64) primary key,
  the_geom geometry(Point,4326),
  type varchar(16),
  description text,
  start timestamp,
  finish timestamp,
  created_at timestamp DEFAULT NOW()
);

create index madrid_traffic_incidences_geom_idx ON madrid_traffic_incidences USING GIST(the_geom);

CREATE TABLE madrid_traffic_servicelevels(
  id serial,
  the_geom geometry(LineString,4326),
  status varchar(16),
  created_at timestamp DEFAULT NOW()
);

create index madrid_traffic_servicelevels_geom_idx ON madrid_traffic_servicelevels USING GIST(the_geom);


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

create index madrid_traffic_intensity_pois ON madrid_traffic_intensity_pois(code);


-- CREATE TABLE madrid_traffic(
--   id varchar(64) ,
--   type varchar(16),
--   subtype varchar(16),
--   description text,
--   start timestamp,
--   finish timestamp,
--   created_at timestamp
-- );

-- SELECT cdb_cartodbfytable('alasarr','madrid_traffic');
--
-- ALTER TABLE madrid_traffic add CONSTRAINT madrid_traffic_id_unique UNIQUE(id);
-- ALTER TABLE madrid_traffic ALTER COLUMN created_at SET DEFAULT NOW();
