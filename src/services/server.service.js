import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class ServerServices {
  async createServer(name, service, ip, unit, fabId, roomId, rackId, frontPosition, backPosition) {
    try {
      const result = await pool.query(
        'INSERT INTO servers (name, service, ip, unit, fabId, roomId, rackId, frontPosition, backPosition) VALUES ($1, $2, $3, $4,$5, $6, $7, $8, $9) RETURNING *',
        [name, service, ip, unit, fabId, roomId, rackId, frontPosition, backPosition],
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
}
const serverService = new ServerServices();

export default serverService;
