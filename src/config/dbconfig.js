require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});
const createFabQuery = `
  CREATE TABLE IF NOT EXISTS Fabs (
    name TEXT NOT NULL,
    ID INTEGER NOT NULL PRIMARY KEY,
    MaxRoomNum INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;
const createRoomQuery = `
  CREATE TABLE IF NOT EXISTS Rooms (
    name TEXT NOT NULL,
    ID INTEGER NOT NULL PRIMARY KEY,
    FabID INTEGER NOT NULL,
    MaxRackNUM INTEGER NOT NULL,
    Height Integer NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FabID) REFERENCES Fabs(ID)
  );
`;
const createRackQuery = `
  CREATE TABLE IF NOT EXISTS Racks (
    name TEXT,
    ID INTEGER NOT NULL PRIMARY KEY,
    FabID INTEGER NOT NULL,
    RoomID INTEGER NOT NULL,
    Service TEXT NOT NULL,
    Height INTEGER NOT NULL,
    Maxremain INTEGER NOT NULL,
    IP TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FabID) REFERENCES Fabs(ID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(ID)
  );
`;
const createMachinesQuery = `
  CREATE TABLE IF NOT EXISTS Machines (
    name TEXT NOT NULL,
    ID INTEGER NOT NULL PRIMARY KEY,
    Service TEXT NOT NULL,
    FabID INTEGER NOT NULL,
    RoomID INTEGER NOT NULL,
    RackID INTEGER NOT NULL,
    start INTEGER NOT NULL,
    end INTEGER NOT NULL,
    Unit INTEGER NOT NULL,
    IP TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (FabID) REFERENCES Fabs(ID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(ID),
    FOREIGN KEY (RackID) REFERENCES Racks(ID)
  );
`;