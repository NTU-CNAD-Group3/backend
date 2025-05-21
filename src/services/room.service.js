import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class RoomServices {
  async createRooms(fabName, roomNum, roomArray) {
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [fabName]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Fab not found` });
      const error = new Error('DC not found');
      error.status = 404;
      throw error;
    }
    const id = (await pool.query('SELECT id FROM fabs WHERE name = $1', [fabName])).rows[0].id;
    // 先假設room名稱可以重複
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lockKey = 2000000000000000 + id;
      await client.query('SELECT pg_advisory_lock($1)', [lockKey]);

      const hasRack = 0;
      const roomPromises = roomArray.map((room) => {
        return client.query('INSERT INTO rooms(name, hasRack, fabId, rackNum, height) VALUES($1, $2, $3, $4, $5)', [
          room.name,
          hasRack,
          id,
          room.rackNum,
          room.height,
        ]);
      });
      await Promise.all(roomPromises);
      await client.query('UPDATE fabs SET roomNum = roomNum + $1,updatedAt = NOW() WHERE name=$2;', [roomNum, fabName]);

      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=${roomNum} rooms created`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=${roomNum} rooms create error`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async getRoom(fabName, roomId) {
    const inFTable = await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [fabName]);
    if (!inFTable.rows[0].exists) {
      logger.error({ message: `msg=Fab not found` });
      const error = new Error('DC not found');
      error.status = 404;
      throw error;
    }
    const fabId = (await pool.query('SELECT id FROM fabs WHERE name = $1', [fabName])).rows[0].id;
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM rooms WHERE fabId = $1 and id = $2)', [fabId, roomId]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Room not found` });
      const error = new Error('Room not found');
      error.status = 404;
      throw error;
    }
    const query = ` 
      SELECT 
        r.id AS room_id, r.name AS room_name, r.rackNum, r.hasRack,r.createdAt,r.updatedAt,r.height,
        rk.id AS rack_id, rk.name AS rack_name, rk.service,rk.height AS rackHeight,
        s.id AS server_id, s.name AS server_name
      FROM fabs dc
      LEFT JOIN rooms r ON r.fabId = dc.id
      LEFT JOIN racks rk ON rk.roomId = r.id
      LEFT JOIN servers s ON s.rackId = rk.id
      WHERE dc.id = $1 and r.id = $2
      ORDER BY r.id, rk.id, s.id
    `;
    const { rows } = await pool.query(query, [fabId, roomId]);
    const result = {
      id: 0,
      name: '',
      maxRack: 0,
      hasRack: 0,
      height: 0,
      createdAt: null,
      updatedAt: null,
      racks: {},
    };

    for (const row of rows) {
      if (!result.name) {
        result.id = row.room_id;
        result.name = row.room_name;
        result.maxRack = row.racknum;
        result.hasRack = row.hasrack;
        result.height = row.height;
        result.createdAt = row.createdat;
        result.updatedAt = row.updatedat;
      }
      // Only if there is a rack
      if (row.rack_id) {
        const rackKey = `rack${row.rack_id}`;
        if (!result.racks[rackKey]) {
          // result.rackNum++;
          result.racks[rackKey] = {
            id: row.rack_id,
            name: row.rack_name,
            service: row.service,
            height: row.rackheight,
            serverNum: 0,
            servers: {},
          };
        }

        const rack = result.racks[rackKey];

        // Only if there is a server
        if (row.server_id) {
          const serverKey = `server${row.server_id}`;
          rack.serverNum++;
          rack.servers[serverKey] = {
            id: row.server_id,
            name: row.server_name,
          };
        }
      }
    }

    logger.info({ message: `msg=Room ${roomId} get` });
    return result;
  }

  async updateRoom(roomId, name, rackNum) {
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)', [roomId]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Room not found` });
      const error = new Error('Room not found');
      error.status = 404;
      throw error;
    }
    await pool.query('UPDATE rooms SET rackNum = $1, name = $2,updatedAt = NOW() WHERE id = $3', [rackNum, name, roomId]);
    logger.info({
      message: `msg=Room ${roomId} updated`,
    });
  }

  async deleteRoom(fabName, roomId) {
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [fabName]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Fab not found` });
      const error = new Error('DC not found');
      error.status = 404;
      throw error;
    }
    const id = (await pool.query('SELECT id FROM fabs WHERE name = $1', [fabName])).rows[0].id;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lockKey = 2000000000000000 + id;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
      const inTable = await client.query('SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)', [roomId]);
      if (!inTable.rows[0].exists) {
        logger.error({ message: `msg=Room not found` });
        const error = new Error('Room not found');
        error.status = 404;
        throw error;
      }

      const isEmpty = await client.query('SELECT EXISTS(SELECT 1 FROM racks WHERE roomId = $1)', [roomId]);
      if (isEmpty.rows[0].exists) {
        logger.error({ message: 'msg=Room is not Empty' });
        const error = new Error('Room is not Empty');
        error.status = 400;
        throw error;
      }
      await client.query('DELETE FROM rooms WHERE id = $1', [roomId]);
      await client.query('UPDATE fabs SET roomNum = roomNum - 1,updatedAt = NOW() WHERE name=$1;', [fabName]);
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Room ${roomId} deleted`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Room ${roomId} deleted error`,
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
const roomService = new RoomServices();

export default roomService;

// async createRoom(name, rackNum, fabId, height) {
//   try {
//     const result = await pool.query('INSERT INTO rooms (name, rackNum, fabId, height) VALUES ($1, $2, $3, $4) RETURNING *', [
//       name,
//       rackNum,
//       fabId,
//       height,
//     ]);
//     logger.info({
//       message: `msg=Room created name=${name} at fabId=${fabId}`,
//     });
//     return result.rows[0];
//   } catch (error) {
//     logger.error({
//       message: `msg=Room create name=${name} at fabId=${fabId} error error=${error}`,
//     });
//   }
// }

// async getHasRack(id) {
//   try {
//     const result = await pool.query('SELECT hasRack FROM rooms WHERE id = $1', [id]);
//     const hasRack = result.rows[0].hasrack;
//     logger.info({
//       message: `msg=Room ${id} check hasRack=${hasRack}`,
//     });
//     return hasRack;
//   } catch (error) {
//     logger.error({
//       message: `msg=Room ${id} check error error=${error}`,
//     });
//   }
// }
// async getRackNum(id) {
//   try {
//     const result = await pool.query('SELECT rackNum FROM rooms WHERE id = $1', [id]);

//     const rackNum = result.rows[0].racknum;
//     logger.info({
//       message: `msg=Room ${id} get rackNum=${rackNum}`,
//     });
//     return rackNum;
//   } catch (error) {
//     logger.error({
//       message: `msg=Room ${id} get error error=${error}`,
//     });
//   }
// }
