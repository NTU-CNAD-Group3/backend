import pg from 'pg';
import config from '#src/config.js';
import logger from '#src/utils/logger.js';

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

const createIpTableText = `
  CREATE TABLE IF NOT EXISTS ipPools (
    id                      SERIAL        PRIMARY KEY,
    service                 VARCHAR(255)  NOT NULL,
    cidr                    INET          NOT NULL,
    usedIps                 INET[]        ,
    createdAt               TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
  ); 
`;

const createFabTableText = `
  CREATE TABLE IF NOT EXISTS fabs (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL UNIQUE,
    roomNum                 INTEGER       NOT NULL CHECK (roomNum >= 0) DEFAULT 0,
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  CREATE UNIQUE INDEX IF NOT EXISTS fabs_name_index ON fabs USING btree (name);
`;
const createRoomTableText = `
  CREATE TABLE IF NOT EXISTS rooms (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL,
    hasRack                 INTEGER       DEFAULT 0,
    rackNum                 INTEGER       NOT NULL CHECK (rackNum >= 0) DEFAULT 0,
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
    fabId                   INTEGER       NOT NULL CHECK (fabId >= 1),
    roomId                  INTEGER       NOT NULL CHECK (roomId >= 1),
    height                  INTEGER       NOT NULL CHECK (height >= 1),
    maxEmpty                INTEGER       NOT NULL CHECK (maxEmpty >= 0 AND maxEmpty <= height),
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fabId)     REFERENCES    fabs(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId)    REFERENCES    rooms(id) ON DELETE CASCADE
  );
`;
const createServerTableText = `
  CREATE TABLE IF NOT EXISTS servers (
    id                      SERIAL        PRIMARY KEY,
    name                    VARCHAR(255)  NOT NULL UNIQUE,
    service                 VARCHAR(255)  NOT NULL,
    ip                      INET          NOT NULL UNIQUE,
    unit                    INTEGER       NOT NULL CHECK (unit >= 1),
    fabId                   INTEGER       NOT NULL CHECK (fabId >= 1),
    roomId                  INTEGER       NOT NULL CHECK (roomId >= 1),
    rackId                  INTEGER       NOT NULL CHECK (rackId >= 1),
    ipPoolId                INTEGER       NOT NULL CHECK (ipPoolId >= 1),
    frontPosition           INTEGER       NOT NULL,
    backPosition            INTEGER       NOT NULL,
    healthy                 BOOLEAN       DEFAULT TRUE,
    createdAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP     WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fabId)     REFERENCES    fabs(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId)    REFERENCES    rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (rackId)    REFERENCES    racks(id) ON DELETE CASCADE,
    FOREIGN KEY (ipPoolId)  REFERENCES    ipPools(id) ON DELETE CASCADE
  );
  CREATE UNIQUE INDEX IF NOT EXISTS servers_name_index ON servers USING btree (name);
`;

const dropTableText = `
  DROP TABLE IF EXISTS servers, racks, rooms, fabs, ipPools CASCADE;
`;

export const databaseConnection = async () => {
  try {
    // await pool.connect();
    await pool.query(createFabTableText);
    await pool.query(createRoomTableText);
    await pool.query(createRackTableText);
    await pool.query(createIpTableText);
    await pool.query(createServerTableText);

    logger.info({
      message: `msg=Database connected`,
    });
  } catch (error) {
    logger.error({
      message: `msg=Database connection error error=${error}`,
    });
  }
};
export const databaseRecreation = async () => {
  try {
    // await pool.connect();
    await pool.query(dropTableText);
    await pool.query(createFabTableText);
    await pool.query(createRoomTableText);
    await pool.query(createRackTableText);
    await pool.query(createIpTableText);
    await pool.query(createServerTableText);

    logger.info({
      message: `msg=Database recreated`,
    });
  } catch (error) {
    logger.error({
      message: `msg=Database recreated error error=${error}`,
    });
  }
};

export const databaseClose = async () => {
  try {
    await pool.end();
    logger.info({
      message: `msg=Database connection closed`,
    });
  } catch (error) {
    logger.error({
      message: `msg=Database connection close error error=${error}`,
    });
  }
};

export default { pool, databaseConnection, databaseRecreation, databaseClose };

import {
  getDcService,
  createDcService,
  getAllDcService,
  updateDcService,
  deleteDcService,
  getRoomService,
  createRoomsService,
  updateRoomService,
  deleteRoomService,
  createServerService,
  getServerService,
  updateServerService,
  deleteServerService,
  getAllServerService,
} from '#src/services/backend.service.js';
export const createDc = async (req, res, next) => {
  const response = await createDcService(req);

  req.session.regenerate(function (err) {
    if (err) next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(201).json(response.data);
    });
  });
};

export const getDc = async (req, res, next) => {
  const response = await getDcService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};
export const getAllDc = async (req, res, next) => {
  const response = await getAllDcService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};
export const updateDc = async (req, res, next) => {
  const response = await updateDcService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};

export const deleteDc = async (req, res, next) => {
  const response = await deleteDcService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};

export const createRooms = async (req, res, next) => {
  const response = await createRoomsService(req);

  req.session.regenerate(function (err) {
    if (err) next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(201).json(response.data);
    });
  });
};

export const getRoom = async (req, res, next) => {
  const response = await getRoomService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};
export const updateRoom = async (req, res, next) => {
  const response = await updateRoomService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};
export const deleteRoom = async (req, res, next) => {
  const response = await deleteRoomService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};

export const createServer = async (req, res, next) => {
  const response = await createServerService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(201).json(response.data);
    });
  });
};


export const getServer = async (req, res, next) => {
  const response = await getServerService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};


export const updateServer = async (req, res, next) => {
  const response = await updateServerService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};


export const deleteServer = async (req, res, next) => {
  const response = await deleteServerService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};

export const getAllServer = async (req, res, next) => {
  const response = await getAllServerService(req);

  req.session.regenerate(function (err) {
    if (err) return next(err);

    req.session.save(function (err) {
      if (err) return next(err);
      res.status(200).json(response.data);
    });
  });
};





import instance from '#src/utils/axios.js';
import config from '#src/config.js';
const axios = instance.create('backend');

// 廠區
export const getDcService = async (req) => {
  const response = await axios.get(config.GET_DC, { params: req.query });
  return response;
};
export const createDcService = async (req) => {
  const response = await axios.post(config.CREATE_DC, req.body);
  return response;
};
export const getAllDcService = async (req) => {
  const response = await axios.get(config.GET_ALL_DC, req.body);
  return response;
};
export const updateDcService = async (req) => {
  const response = await axios.put(config.UPDATE_DC, req.body);
  return response;
};

export const deleteDcService = async (req) => {
  const response = await axios.delete(config.DELETE_DC, { data: req.body });
  return response;
};

// 機房
export const getRoomService = async (req) => {
  const response = await axios.get(config.GET_ROOM, {params: req.query});
  return response;
};
export const createRoomsService = async (req) => {
  const response = await axios.post(config.CREATE_ROOMS, req.body);
  return response;
};
export const updateRoomService = async (req) => {
  const response = await axios.put(config.UPDATE_ROOM, req.body);
  return response;
};

export const deleteRoomService = async (req) => {
  const response = await axios.delete(config.DELETE_ROOM, { data: req.body });
  return response;
};

// 伺服器
export const getServerService = async (req) => {
  const response = await axios.get(config.GET_SERVER, { params: req.query });
  return response;
};

export const createServerService = async (req) => {
  const response = await axios.post(config.CREATE_SERVER, req.body);
  return response;
};

export const updateServerService = async (req) => {
  const response = await axios.put(config.UPDATE_SERVER, req.body);
  return response;
};

export const deleteServerService = async (req) => {
  const response = await axios.delete(config.DELETE_SERVER, { data: req.body });
  return response;
};

export const getAllServerService = async (req) => {
  const response = await axios.get(config.GET_ALL_SERVER, req.body);
  return response;
};


