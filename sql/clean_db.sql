CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE users;
CREATE TABLE users (
    user_id     uuid DEFAULT uuid_generate_v1(),
    name       varchar(400) NOT NULL,
    email       varchar(400) NOT NULL,
    password   varchar(400) NOT NULL,
    admin        boolean,
    created_at   timestamptz DEFAULT NOW(),
	PRIMARY KEY (user_id)
);

DROP TABLE roles;
CREATE TABLE roles (
     role_id uuid DEFAULT uuid_generate_v1(),
     user_id uuid,
	 role varchar(50) NOT NULL,
	 created_at timestamptz DEFAULT NOW(),
	 PRIMARY KEY (role_id)
);
DROP TABLE datapacks;
CREATE TABLE datapacks (
     datapack_id uuid DEFAULT uuid_generate_v1(),
     user_id uuid,
	 name varchar(400) NOT NULL,
	 description text,
	 data_year integer NOT NULL,
	 uploaded_at timestamptz DEFAULT NOW(),
	 size integer,
	 private boolean,
         file_path text,
	contents json,
	 PRIMARY KEY (datapack_id)
);

DROP TABLE analysis;
CREATE TABLE analysis (
     analysis_id uuid,
     user_id uuid,
	 name varchar(400) NOT NULL,
	 description text,
	 datapack_id uuid,
	 run_year integer NOT NULL,
	 created_at timestamptz DEFAULT NOW(),
	 completed_at timestamptz,
	 input_dir_hash uuid,
     output_dir_hash uuid,
	 status varchar(20),
	 PRIMARY KEY (analysis_id)
);

DROP TABLE analysis_log;
CREATE TABLE analysis_log (
	analysis_id uuid,
	log_time timestamptz DEFAULT NOW(),
	log_text text,
	status text
);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO firehubuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
