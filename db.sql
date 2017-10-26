CREATE TABLE madrid_traffic(
  id varchar(64) primary key,
  the_geom geometry(Point,4326),
  type varchar(16),
  subtype varchar(16),
  description text,
  start timestamp,
  finish timestamp,
  created_at timestamp DEFAULT NOW()
);

create index madrid_traffic_geom_idx ON madrid_traffic USING GIST(the_geom);

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
