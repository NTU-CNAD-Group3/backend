import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import fabService from '#src/services/fab.service.js';
import roomService from '#src/services/room.service.js';
class AdminServices {
  async watchFab(name) {
    try {
      const result = await fabService.getFabDetails(name);
      return result.rows; // 可以更改要印出的結構目前是並排
    } catch (error) {
      logger.error({
        message: `msg=watchFab error error=${error}`,
      });
    }
  }

  async createFab(name, roomNum, roomArray) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const fab = await fabService.createFab(name, roomNum);
      const fabId = fab.id;
      const roomPromises = roomArray.map((room) => {
        return roomService.createRoom(room.name, room.rackNum, fabId, room.height);
      });
      const rooms = await Promise.all(roomPromises);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Fab created with ${rooms.length} rooms`,
      });
      return { fab, rooms };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Error creating fab and rooms error=${error}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }
}
const adminService = new AdminServices();

export default adminService;
