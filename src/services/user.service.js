import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import serverService from '#src/services/server.service.js';
import ipService from '#src/services/ip.service.js';

class UserServices {
  async addServer(name, service, unit, fabId, roomId, rackId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const [ip, ipPoolId] = await ipService.assign(fabId, service);

      // 假設一定有空間可以放，在前端展示時應該可以抓取rack的maxEmpty，不能放不能發請求
      // TODO
      // compute the position
      const frontPosition = 0;
      const backPosition = 0;

      const server = await serverService.createServer(name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Server ${name} created`,
      });
      return server;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Server ${name} created error=${error}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteServer(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const server = await serverService.deleteServer(id);

      await ipService.release(id);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Server ${id} deleted`,
      });
      return server;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Server ${id} deleted error=${error}`,
      });
    } finally {
      client.release();
    }
  }

}
const userService = new UserServices();

export default userService;
