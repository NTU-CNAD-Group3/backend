import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class RackServices {
  async createRacks(fabName, roomId, rackNum, rackArray) {
    // 先假設rack名稱可以重複
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lockKey = 3001;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);

      const inTable = await client.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [fabName]);
      if (!inTable.rows[0].exists) {
        logger.error({ message: `msg=Fab not found` });
        const error = new Error('DC not found');
        error.status = 404;
        throw error;
      }
      const fabId = (await client.query('SELECT id FROM fabs WHERE name = $1', [fabName])).rows[0].id;
      const inRTable = await client.query('SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)', [roomId]);
      if (!inRTable.rows[0].exists) {
        logger.error({ message: `msg=Room not found` });
        const error = new Error('Room not found');
        error.status = 404;
        throw error;
      }

      const constraint = (await client.query('SELECT rackNum, hasRack, height FROM rooms WHERE id = $1', [roomId])).rows[0];
      if (constraint.hasrack + rackNum > constraint.racknum) {
        const error = new Error('Rack numbor out of room limitation');
        error.status = 400;
        throw error;
      }

      const rackPromises = rackArray.map((rack) => {
        if (rack.height>constraint.height){
          const error = new Error('Rack height out of room limitation');
          error.status = 400;
          throw error;
        }
        return client.query('INSERT INTO racks (name, service,  fabId, roomId, height ,maxEmpty) VALUES ($1, $2, $3, $4,$5, $6)', [
          rack.name,
          rack.service,
          fabId,
          roomId,
          rack.height,
          rack.height, // maxempty default is height
        ]);
      });
      await Promise.all(rackPromises);
      await client.query('UPDATE rooms SET hasRack = hasRack + $1 WHERE id=$2;', [rackNum, roomId]);

      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=${rackNum} racks created`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=${rackNum} racks create error`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async getRack(fabName, roomId, rackId) {
    const inFTable = await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [fabName]);
    if (!inFTable.rows[0].exists) {
      logger.error({ message: `msg=Fab not found` });
      const error = new Error('DC not found');
      error.status = 404;
      throw error;
    }
    const fabId = (await pool.query('SELECT id FROM fabs WHERE name = $1', [fabName])).rows[0].id;
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM racks WHERE fabId = $1 and roomId = $2 and id = $3)', [
      fabId,
      roomId,
      rackId,
    ]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Room not found` });
      const error = new Error('Room not found');
      error.status = 404;
      throw error;
    }
    const query = ` 
      SELECT 
        rk.id AS rack_id, rk.name AS rack_name, rk.service, rk.maxEmpty, rk.service, rk.height,
        s.id AS server_id, s.name AS server_name, s.unit,
      FROM rooms r
      LEFT JOIN racks rk ON rk.roomId = r.id
      LEFT JOIN servers s ON s.rackId = rk.id
      WHERE r.id = $1 and rk.id = $2
      ORDER BY rk.id, s.id
    `;
    const { rows } = await pool.query(query, [roomId, rackId]);
    const result = {
      name: '',
      maxEmpty: 0,
      height: 0,
      service: '',
      serverNum: 0,
      createdAt: null,
      updatedAt: null,
      servers: {},
    };

    for (const row of rows) {
      if (!result.name) {
        result.name = row.rack_name;
        result.maxEmpty = row.maxempty;
        result.height = row.height;
        result.service = row.service;
        result.createdAt = row.createdat;
        result.updatedAt = row.updatedat;
      }

      // Only if there is a server
      if (row.server_id) {
        const serverKey = `server${row.server_id}`;
        result.serverNum++;
        result.servers[serverKey] = {
          name: row.server_name,
        };
      }
    }

    logger.info({ message: `msg=Rack ${rackId} get` });
    return result;
  }

  async updateRack(rackId, name) {
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM racks WHERE id = $1)', [rackId]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Rack not found` });
      const error = new Error('Rack not found');
      error.status = 404;
      throw error;
    }
    await pool.query('UPDATE racks SET name = $1 WHERE id = $2', [name, rackId]);
    logger.info({
      message: `msg=Rack ${rackId} updated`,
    });
  }

  async deleteRack(roomId, id) {
    const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM racks WHERE id = $1)', [roomId]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Rack not found` });
      const error = new Error('Rack not found');
      error.status = 404;
      throw error;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM racks WHERE id = $1', [id]);
      await client.query('UPDATE rooms SET hasRack = hasRack - 1 WHERE id=$1;', [roomId]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Rack ${roomId} deleted`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Rack ${roomId} deleted error`,
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
const rackService = new RackServices();

export default rackService;
