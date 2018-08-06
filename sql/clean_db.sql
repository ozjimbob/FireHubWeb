CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    user_id     uuid DEFAULT uuid_generate_v1(),
    name       varchar(400) NOT NULL,
    email       varchar(400) NOT NULL,
    password   varchar(400) NOT NULL,
    admin        boolean,
    created_at   timestamptz DEFAULT NOW(),
	PRIMARY KEY (user_id)
);

CREATE TABLE roles (
     role_id uuid DEFAULT uuid_generate_v1(),
     user_id uuid,
	 role varchar(50) NOT NULL,
	 created_at timestamptz DEFAULT NOW(),
	 PRIMARY KEY (role_id)
);

CREATE TABLE datapacks (
     datapack_id uuid DEFAULT uuid_generate_v1(),
     user_id uuid,
	 name varchar(400) NOT NULL,
	 description text,
	 data_year integer NOT NULL,
	 uploaded_at timestamptz DEFAULT NOW(),
     dir_hash uuid,
	 size integer,
	 private boolean,
	 PRIMARY KEY (datapack_id)
);

CREATE TABLE analysis (
     analysis_id uuid DEFAULT uuid_generate_v1(),
     user_id uuid,
	 name varchar(400) NOT NULL,
	 description text,
	 run_year integer NOT NULL,
	 created_at timestamptz DEFAULT NOW(),
	 completed_at timestamptz,
	 input_dir_hash uuid,
     output_dir_hash uuid,
	 status varchar(20),
	 PRIMARY KEY (analysis_id)
);

