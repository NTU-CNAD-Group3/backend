import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class RackServices {
  async createRack(name, service, ip, fabId, roomId, height) {
    try {
      const result = await pool.query(
        'INSERT INTO racks (name, service, ip, fabId, roomId, height ,maxEmpty) VALUES ($1, $2, $3, $4,$5, $6, $7) RETURNING *',
        [
          name,
          service,
          ip,
          fabId,
          roomId,
          height,
          height, // maxempty default is height
        ],
      );
      logger.info({
        message: `msg=Rack created name=${name} at roomId=${roomId}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Rack create name=${name} at roomId=${roomId} error error=${error}`,
      });
    }
  }

  async getMaxEmpty(id) {
    try {
      const maxEmpty = await pool.query('SELECT maxEmpty FROM racks WHERE id = $1', [id]).rows[0].maxEmpty;
      logger.info({
        message: `msg=Rack ${id} check maxEmpty=${maxEmpty}`,
      });
      return maxEmpty;
    } catch (error) {
      logger.error({
        message: `msg=Rack ${id} check error error=${error}`,
      });
    }
  }

  async deleteRack(id) {
    try {
      const result = await pool.query('DELETE FROM racks WHERE id = $1 RETURNING *', [id]);
      logger.info({
        message: `msg=Rack ${id} deleted`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Rack ${id} deleted error error=${error}`,
      });
    }
  }
}
const rackService = new RackServices();

export default rackService;
