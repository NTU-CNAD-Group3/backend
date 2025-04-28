import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import serverService from '#src/services/server.service.js';
import ipService from '#src/services/ip.service.js';

class UserServices {
  async addServer(name, service, unit, fabId, roomId, rackId, frontPosition, backPosition) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const [ip, ipPoolId] = await ipService.assign(service);

      const server = await serverService.createServer(
        name,
        service,
        ip,
        unit,
        fabId,
        roomId,
        rackId,
        ipPoolId,
        frontPosition,
        backPosition,
      );
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

      await ipService.release(id);
      const server = await serverService.deleteServer(id);

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

  async createIpPool(service, cidrBlock) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const ipPool = await ipService.createIpPool(service, cidrBlock);
      await client.query('COMMIT');
      logger.info({
        message: `msg=IP Pool ${cidrBlock} created`,
      });
      return ipPool;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=IP Pool ${cidrBlock} created error=${error}`,
      });
    } finally {
      client.release();
    }
  }
}
const userService = new UserServices();

export default userService;
