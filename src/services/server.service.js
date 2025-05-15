import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import ipService from '#src/services/ip.service.js';

class ServerServices {
  async createServer(name, service, unit, fabId, roomId, rackId, frontPosition, backPosition) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lockKey = 4000000000000000 + rackId;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
      const inTable = await pool.query('SELECT EXISTS(SELECT 1 FROM racks WHERE id = $1)', [rackId]);
      if (!inTable.rows[0].exists) {
        logger.error({ message: `msg=Rack not found` });
        const error = new Error('Rack not found');
        error.status = 404;
        throw error;
      }
      const serviceCheck = await client.query('SELECT service FROM racks WHERE id = $1', [rackId]);
      if (serviceCheck.rows[0].service !== service) {
        const error = new Error('Server with the service can not insert to this rack');
        error.status = 400;
        throw error;
      }
      const overlapQuery = `SELECT * FROM servers WHERE rackId = $1 AND (($2 BETWEEN frontPosition AND backPosition) OR ($3 BETWEEN frontPosition AND backPosition) OR (frontPosition BETWEEN $2 AND $3) OR (backPosition BETWEEN $2 AND $3))`;
      const overlapResult = await client.query(overlapQuery, [rackId, frontPosition, backPosition]);

      if (overlapResult.rows.length > 0) {
        throw new Error('Position already occupied in this rack.');
      }

      const [ip, ipPoolId] = await ipService.assign(client, service);
      const result = await client.query(
        'INSERT INTO servers (name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition],
      );
      logger.info({
        message: `msg=Server created name=${name}`,
      });
      const server = result.rows[0];
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Server ${name} created`,
      });
      return server;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Server create name=${name} error error=${error}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteServer(rackId, id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lockKey = 4000000000000000 + rackId;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
      await ipService.release(client, id);
      await client.query('DELETE FROM servers WHERE id = $1', [id]);
      logger.info({
        message: `msg=Server ${id} deleted`,
      });
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Server ${id} deleted`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Server ${id} deleted error=${error}`,
      });
    } finally {
      client.release();
    }
  }

  async moveServer(id, newFabId, newRoomId, newRackId, service, frontPosition, backPosition) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const lockKey = 4000000000000000 + newRackId;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
      const serviceCheck = await client.query('SELECT service FROM racks WHERE id = $1', [newRackId]);
      if (serviceCheck.rows[0].service !== service) {
        const error = new Error('Server with the service can not insert to this rack');
        error.status = 400;
        throw error;
      }
      const overlapQuery = `SELECT * FROM servers WHERE rackId = $1 AND (($2 BETWEEN frontPosition AND backPosition) OR ($3 BETWEEN frontPosition AND backPosition) OR (frontPosition BETWEEN $2 AND $3) OR (backPosition BETWEEN $2 AND $3))`;
      const overlapResult = await client.query(overlapQuery, [newRackId, frontPosition, backPosition]);

      if (overlapResult.rows.length > 0) {
        const error = new Error('Position already occupied in this rack.');
        error.status = 400;
        throw error;
      }
      await pool.query(
        'UPDATE servers SET  service = $1, fabId = $2, roomId = $3, rackId = $4,  frontPosition = $5, backPosition = $6, updatedAt = NOW() WHERE id = $7',
        [service, newFabId, newRoomId, newRackId, frontPosition, backPosition, id],
      );
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Server ${id} moved`,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Server ${id} moved error=${error}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async repair(id) {
    try {
      await pool.query('UPDATE servers SET healthy = True,updatedAt = NOW() WHERE id = $1', [id]);
      logger.info({
        message: `msg=Server ${id} repaird`,
      });
    } catch (error) {
      logger.error({
        message: `msg=Server ${id} repaird error error=${error}`,
      });
      throw error;
    }
  }

  async broken(id) {
    try {
      await pool.query('UPDATE servers SET healthy = False,updatedAt = NOW() WHERE id = $1', [id]);
      logger.info({
        message: `msg=Server ${id} broken`,
      });
    } catch (error) {
      logger.error({
        message: `msg=Server ${id} broken error error=${error}`,
      });
      throw error;
    }
  }

  async getAllServerBroken() {
    try {
      const result = await pool.query('SELECT * FROM servers WHERE healthy = False');
      logger.info({
        message: `msg=getAllServerBroken`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=getAllServerBroken error error=${error}`,
      });
      throw error;
    }
  }

  async updateServerName(id, newName) {
    try {
      await pool.query('UPDATE servers SET name = $1,updatedAt = NOW() WHERE id = $2', [newName, id]);
      logger.info({
        message: `msg=Server ${id} updateServerName`,
      });
    } catch (error) {
      logger.error({
        message: `msg=Server ${id} updateServerName error error=${error}`,
      });
      throw error;
    }
  }

  // server 詳細資訊
  async getServer(id) {
    try {
      const result = await pool.query('SELECT * FROM servers WHERE id = $1', [id]);
      logger.info({
        message: `msg=Get server by id=${id}`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=Get server by id=${id} error error=${error}`,
      });
    }
  }

  // 前端若需要一個列表顯示
  async getAllServers() {
    try {
      const result = await pool.query('SELECT * FROM servers ORDER BY id');
      logger.info({
        message: `msg=Get all servers`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=Get all servers error error=${error}`,
      });
      throw error;
    }
  }

  // 相似度搜尋
  async getServerByType(keyword, type, page, size) {
    try {
      const result = await pool.query(
        `SELECT * FROM servers 
        WHERE ${type} % $1
        ORDER BY similarity(${type}, $1) DESC
        LIMIT $2
        OFFSET $3`,
        [keyword, size, page * size],
      );
      logger.info({
        message: `msg=getServerByType`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=getServerByType error error=${error}`,
      });
      throw error;
    }
  }
}
const serverService = new ServerServices();

export default serverService;

// async updateServer(id, name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, healthy) {
//   try {
//     const result = await pool.query(
//       'UPDATE servers SET name = $1, service = $2, ip = $3, unit = $4, fabId = $5, roomId = $6, rackId = $7, ipPoolId = $8, frontPosition = $9, backPosition = $10, healthy = $11 WHERE id = $12 RETURNING *',
//       [name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, healthy, id],
//     );
//     logger.info({
//       message: `msg=Server ${id} updated`,
//     });
//     return result.rows[0];
//   } catch (error) {
//     logger.error({
//       message: `msg=Server ${id} updated error error=${error}`,
//     });
//   }
// }
// async getServerByName(name) {
//   try {
//     const result = await pool.query('SELECT * FROM servers WHERE name ILIKE $1', [name]);
//     logger.info({ message: `msg=Get server by name=${name}` });
//     return result.rows[0];
//   } catch (error) {
//     logger.error({
//       message: `msg=Get server by name=${name} error error=${error}`,
//     });
//   }
// }

// async getServerByIp(ip) {
//   try {
//     const result = await pool.query('SELECT * FROM servers WHERE ip = $1', [ip]);
//     logger.info({
//       message: `msg=Get server by ip=${ip}`,
//     });
//     return result.rows[0];
//   } catch (error) {
//     logger.error({
//       message: `msg=Get server by ip=${ip} error error=${error}`,
//     });
//   }
// }

// async getAllServerByService(service) {
//   try {
//     const result = await pool.query('SELECT * FROM servers WHERE service ILIKE $1', [service]);
//     logger.info({ message: `msg=Get all servers by service=${service}` });
//     return result.rows;
//   } catch (error) {
//     logger.error({
//       message: `msg=Get all servers by service=${service} error error=${error}`,
//     });
//   }
// }
