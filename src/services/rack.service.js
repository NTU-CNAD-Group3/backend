import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class RackServices {
  async createRacks(fabName, roomId, rackNum, rackArray) {
    // 先假設rack名稱可以重複
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lockKey = 3000000000000000 + roomId;
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
        const error = new Error('Rack number out of room limitation');
        error.status = 400;
        throw error;
      }

      const rackPromises = rackArray.map((rack) => {
        if (rack.height > constraint.height) {
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
      logger.error({ message: `msg=Rack not found` });
      const error = new Error('Rack not found');
      error.status = 404;
      throw error;
    }
    const query = ` 
      SELECT 
        rk.id AS rack_id, rk.name AS rack_name, rk.service, rk.maxEmpty, rk.height,rk.createdAt,rk.updatedAt,
        s.id AS server_id, s.name AS server_name, s.unit, s.frontPosition AS serverFrontPosition, s.backPosition AS serverBackPosition, s.updatedAt as serverUpdateTime
      FROM rooms r
      LEFT JOIN racks rk ON rk.roomId = r.id
      LEFT JOIN servers s ON s.rackId = rk.id
      WHERE r.id = $1 and rk.id = $2
      ORDER BY rk.id, s.id
    `;
    const { rows } = await pool.query(query, [roomId, rackId]);
    const result = {
      id: 0,
      name: '',
      maxEmpty: 0,
      height: 0,
      service: '',
      serverNum: 0,
      createdAt: null,
      updatedAt: null,
      servers: {},
    };
    let a = new Date('2024-05-10T12:00:00Z');
    let b = new Date('2024-05-11T12:00:00Z');
    let shouldupdate = false;
    // const occupied = [];
    for (const row of rows) {
      if (!result.name) {
        result.id = row.rack_id;
        result.name = row.rack_name;
        result.maxEmpty = row.maxempty;
        result.height = row.height;
        result.service = row.service;
        result.createdAt = row.createdat;
        result.updatedAt = row.updatedat;
        a = new Date(row.updatedat);
      }

      // Only if there is a server
      if (row.server_id) {
        const serverKey = `server${row.server_id}`;
        result.serverNum++;
        result.servers[serverKey] = {
          id: row.server_id,
          name: row.server_name,
          serverFrontPosition: row.serverfrontposition,
          serverBackPosition: row.serverbackposition,
        };
        b = new Date(row.serverUpdateTime);
        if (a < b) {
          shouldupdate = true;
        }
        // if (row.serverfrontposition != null && row.serverbackposition != null) {
        //   occupied.push([Number(row.serverfrontposition), Number(row.serverbackposition)]);
        // }
      }
    }
    if (shouldupdate) {
      const queryGap = `WITH gaps AS (
        SELECT
          LAG(backPosition, 1, 0) OVER (ORDER BY frontPosition) AS prev_end,
          frontPosition - LAG(backPosition, 1, 0) OVER (ORDER BY frontPosition) AS gap
        FROM servers
        WHERE rackId = $1
        ORDER BY frontPosition
      )
      SELECT 
        CASE 
          WHEN NOT EXISTS (SELECT 1 FROM servers WHERE rackId = $1) THEN $2  
        ELSE
          GREATEST(
            (SELECT MIN(frontPosition) FROM servers WHERE rackId = $1) - 0,  
            MAX(gap),  
            ($2 - (SELECT MAX(backPosition) FROM servers WHERE rackId = $1))  -
          )
      END AS maxgap;`;
      const maxgap = await pool.query(queryGap, [rackId, result.height]);
      result.maxEmpty = maxgap;

      // update maxEmpty
      await pool.query('UPDATE racks SET maxEmpty = $1 WHERE id = $2', [rackId, result.maxEmpty]);
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lockKey = 3000000000000000 + roomId;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
      const inTable = await client.query('SELECT EXISTS(SELECT 1 FROM racks WHERE id = $1)', [id]);
      if (!inTable.rows[0].exists) {
        logger.error({ message: `msg=Rack not found` });
        const error = new Error('Rack not found');
        error.status = 404;
        throw error;
      }
      await client.query('DELETE FROM racks WHERE id = $1', [id]);
      await client.query('UPDATE rooms SET hasRack = hasRack - 1 WHERE id=$1;', [roomId]);
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Rack ${id} deleted`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Rack ${id} deleted error`,
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
const rackService = new RackServices();

export default rackService;
