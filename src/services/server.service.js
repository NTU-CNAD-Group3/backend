import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class ServerServices {
  async createServer(name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition) {
    try {
      const overlapQuery = `SELECT * FROM servers WHERE rackId = $1 AND (($2 BETWEEN frontPosition AND backPosition) OR ($3 BETWEEN frontPosition AND backPosition) OR (frontPosition BETWEEN $2 AND $3) OR (backPosition BETWEEN $2 AND $3))`;
      const overlapResult = await pool.query(overlapQuery, [rackId, frontPosition, backPosition]);

      if (overlapResult.rows.length > 0) {
        throw new Error('Position already occupied in this rack.');
      }
      const result = await pool.query(
        'INSERT INTO servers (name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition],
      );
      logger.info({
        message: `msg=Server created name=${name}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Server create name=${name} error error=${error}`,
      });
    }
  }

  async deleteServer(id) {
    try {
      const result = await pool.query('DELETE FROM servers WHERE id = $1 RETURNING *', [id]);
      logger.info({
        message: `msg=Server ${id} deleted`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Server ${id} deleted error error=${error}`,
      });
    }
  }

  async updateServer(id, name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition) {
    try {
      const result = await pool.query(
        'UPDATE servers SET name = $1, service = $2, ip = $3, unit = $4, fabId = $5, roomId = $6, rackId = $7, ipPoolId = $8, frontPosition = $9, backPosition = $10 WHERE id = $11 RETURNING *',
        [name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, id],
      );
      logger.info({
        message: `msg=Server ${id} updated`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Server ${id} updated error error=${error}`,
      });
    }
  }

  async getServer(id) {
    try {
      const result = await pool.query('SELECT * FROM servers WHERE id = $1', [id]);
      logger.info({
        message: `msg=Get server by id=${id}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Get server by id=${id} error error=${error}`,
      });
    }
  }

  async getAllServers() {
    try {
      const result = await pool.query('SELECT * FROM servers');
      logger.info({
        message: `msg=Get all servers`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=Get all servers error error=${error}`,
      });
    }
  }


}
const serverService = new ServerServices();

export default serverService;
