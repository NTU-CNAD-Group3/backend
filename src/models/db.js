import pg from 'pg';
import config from '@/config.js';
import logger from '@/utils/logger.js';

export const pool = new pg.Pool({
  host: `${config.DATABASE_HOST}`,
  user: `${config.DATABASE_USER}`,
  password: `${config.DATABASE_PASSWORD}`,
  port: `${config.DATABASE_PORT}`,
  database: `${config.DATABASE_NAME}`,
});

pool.on('error', () => {
  process.exit(-1);
});

const createFabTableText = `
  CREATE TABLE IF NOT EXISTS fabs (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL UNIQUE,
    roomNum                 INTEGER       NOT NULL CHECK (roomNum >= 1),
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  );
  CREATE UNIQUE INDEX IF NOT EXISTS fabs_name_index ON fabs USING btree (name);
`;
const createRoomTableText = `
  CREATE TABLE IF NOT EXISTS rooms (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL,
    rackNum                 INTEGER       NOT NULL CHECK (rackNum >= 1),
    fabId                   INTEGER       NOT NULL CHECK (fabId >= 1),
    height                  INTEGER       NOT NULL CHECK (height >= 1),
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fabId)     REFERENCES    fabs(id) ON DELETE CASCADE
  );
`;
const createRackTableText = `
  CREATE TABLE IF NOT EXISTS racks (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL,
    service                 VARCHAR(255)  NOT NULL,
    ip                      INET          NOT NULL,
    rackNum                 INTEGER       NOT NULL CHECK (rackNum >= 1),
    fabId                   INTEGER       NOT NULL CHECK (fabId >= 1),
    roomId                  INTEGER       NOT NULL CHECK (roomId >= 1),
    height                  INTEGER       NOT NULL CHECK (height >= 1),
    maxEmpty                INTEGER       NOT NULL CHECK (maxEmpty >= 0 AND maxEmpty<=height),
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fabId)     REFERENCES    fabs(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId)    REFERENCES    rooms(id) ON DELETE CASCADE
  );
`;
const createMachineTableText = `
  CREATE TABLE IF NOT EXISTS machines (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL UNIQUE,
    service                 VARCHAR(255)  NOT NULL,
    ip                      INET          NOT NULL,
    unit                    INTEGER       NOT NULL CHECK (unit >= 1),
    fabId                   INTEGER       NOT NULL CHECK (fabId >= 1),
    roomId                  INTEGER       NOT NULL CHECK (roomId >= 1),
    rackId                  INTEGER       NOT NULL CHECK (rackId >= 1),
    frontPosition           INTEGER       NOT NULL,
    backPosition            INTEGER       NOT NULL,
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fabId)     REFERENCES    fabs(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId)    REFERENCES    rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (rackId)    REFERENCES    racks(id) ON DELETE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS machines_name_index ON machines USING btree (name);
`;
export const databaseConnection = async () => {
  try {
    await pool.connect();
    await pool.query(createFabTableText);
    await pool.query(createRoomTableText);
    await pool.query(createRackTableText);
    await pool.query(createMachineTableText);
    logger.info({
      message: `msg=Database connected`,
    });
  } catch (error) {
    logger.error({
      message: `msg=Database connection error error=${error}`,
    });
  }
};
