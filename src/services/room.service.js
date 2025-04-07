import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class RoomServices {
  async createRoom(name, rackNum, fabId, height) {
    try {
      const result = await pool.query('INSERT INTO rooms (name, rackNum, fabId, height) VALUES ($1, $2, $3, $4) RETURNING *', [
        name,
        rackNum,
        fabId,
        height,
      ]);
      logger.info({
        message: `msg=Room created name=${name} at fabId=${fabId}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Room create name=${name} at fabId=${fabId} error error=${error}`,
      });
    }
  }

  async getHasRack(id) {
    try {
      const result = await pool.query('SELECT hasRack FROM rooms WHERE id = $1', [id]);
      const hasRack = result.rows[0].hasrack;
      logger.info({
        message: `msg=Room ${id} check hasRack=${hasRack}`,
      });
      return hasRack;
    } catch (error) {
      logger.error({
        message: `msg=Room ${id} check error error=${error}`,
      });
    }
  }

  async getRackNum(id) {
    try {
      const result = await pool.query('SELECT rackNum FROM rooms WHERE id = $1', [id]);

      const rackNum = result.rows[0].racknum;
      logger.info({
        message: `msg=Room ${id} get rackNum=${rackNum}`,
      });
      return rackNum;
    } catch (error) {
      logger.error({
        message: `msg=Room ${id} get error error=${error}`,
      });
    }
  }

  async updateRoom(id, hasRack) {
    try {
      const result = await pool.query('UPDATE rooms SET hasRack = $1 WHERE id = $2 RETURNING *', [hasRack, id]);
      logger.info({
        message: `msg=Room ${id} updated hasRack=${hasRack}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Room ${id} updated error error=${error}`,
      });
    }
  }
}
const roomService = new RoomServices();

export default roomService;
