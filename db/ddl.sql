--INCIDENCES
CREATE TABLE madrid_traffic_incidences(
  id varchar(64) primary key,
  the_geom geometry(Point,4326),
  type varchar(16),
  description text,
  is_planned boolean,
  is_foreseen boolean,
  start timestamp,
  finish timestamp,
  created_at timestamp
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
  created_at timestamp
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
  created_at timestamp
);
CREATE INDEX madrid_traffic_intensity_pois_idx ON madrid_traffic_intensity_pois(code);

--INTENSITY LINES
CREATE TABLE madrid_traffic_intensity_lines(
  id serial,
  the_geom geometry(LineString,4326),
  intensity integer,
  created_at timestamp
);
SELECT cdb_cartodbfytable('madrid_traffic_intensity_lines');

--CAMERAS
CREATE TABLE madrid_traffic_cameras(
  the_geom geometry(Point,4326),
  name text,
  cod_id text,
  url text,
  created_at timestamp
);
SELECT cdb_cartodbfytable('madrid_traffic_cameras');

--DISTRICTS
CREATE OR REPLACE VIEW madrid_traffic_districts_pond_v As (
  SELECT
    cartodb_id, the_geom, the_geom_webmercator, name,

    CASE
      WHEN jm_pond = 0 THEN 'no_data'
      WHEN jm_pond BETWEEN 0 AND 50 THEN 'low'
      WHEN jm_pond BETWEEN 50 AND 100 THEN 'medium'
      ELSE 'high'
    END as pond
  FROM (
    SELECT
      ds.cartodb_id, ds.the_geom, ds.nombre as name,
      ds.the_geom_webmercator,
      COALESCE(SUM(jm.level_pond), 0) as jm_pond
    FROM madrid_historic_district ds
    LEFT JOIN LATERAL (
      SELECT
        CASE
          WHEN level = 1 OR level IS NULL THEN 1
          WHEN level = 2 THEN 2
          WHEN level = 3 THEN 4
          ELSE 8
        END as level_pond
      FROM madrid_waze_data_jams_mv
      WHERE ST_Intersects(ds.the_geom, the_geom)
    ) jm ON TRUE
    GROUP BY ds.cartodb_id
  ) _q
);
GRANT SELECT ON madrid_traffic_districts_pond_v TO publicuser;

-- POLLUTION INCIDENCES
CREATE TABLE madrid_traffic_pollution_incidences(
  id integer,
  level text,
  description text,
  measures text,
  exceptions text,
  start timestamp,
  finish timestamp,
  created_at timestamp
);
SELECT cdb_cartodbfytable('madrid_traffic_pollution_incidences');
CREATE INDEX madrid_traffic_pollution_incidences_start_idx ON madrid_traffic_pollution_incidences(start);
CREATE INDEX madrid_traffic_pollution_incidences_finish_idx ON madrid_traffic_pollution_incidences(finish);
CREATE INDEX madrid_traffic_pollution_incidences_level_idx ON madrid_traffic_pollution_incidences(level);

-- TLIGHTS ACUSTW
CREATE TABLE madrid_traffic_tlights_acustw(
  tipo_elem text,
  distrito integer,
  id integer,
  id_cruce integer,
  fecha_inst text,
  utm_x double precision,
  utm_y double precision,
  latitud double precision,
  longitud double precision,
  created_at timestamp
);
SELECT cdb_cartodbfytable('madrid_traffic_tlights_acustw');

-- TLIGHTS RED
CREATE TABLE madrid_traffic_tlights_red(
  id integer,
  nombre text,
  activo integer,
  distrito text,
  id_cruce integer,
  fecha_denu text,
  created_at timestamp
);
SELECT cdb_cartodbfytable('madrid_traffic_tlights_red');

-- POLUTION SCENARIOS LABELS
CREATE TABLE madrid_traffic_pollution_scenarios(
  codigo integer,
  fecha timestamp,
  descripcion text,
  created_at timestamp
);
SELECT cdb_cartodbfytable('madrid_traffic_pollution_scenarios');
CREATE INDEX madrid_traffic_pollution_scenarios_codigo_idx ON madrid_traffic_pollution_scenarios(codigo);
