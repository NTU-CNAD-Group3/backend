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
  async getRackNum(id) {
    try {
      const result = await pool.query('SELECT hasRack FROM rooms WHERE id = $1', [id]);
      logger.info({
        message: `msg=Room ${id} check hasRack=${rackNum}`,
      });
      return result.rows[0].hasRack;
    } catch (error) {
      logger.error({
        message: `msg=Room ${id} check error error=${error}`,
      });
    }
  }
  async updateRoom(id, hasRack) {
    try {
      const result = await pool.query('UPDATE rooms SET hasRack = $1 WHERE id = $2 RETURNING *', [hasRack, id]);
      logger.info({
        message: `msg=Room ${id} updated hasRack=${rackNum}`,
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
