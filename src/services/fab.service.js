import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class FabServices {
  async getFabDetails(name) {
    try {
      // 可以自己改要印出甚麼記得名子衝突要重新用AS命名
      // 也可以同時多張表，利用多個LEFT JOIN
      const query = `
            SELECT  f.id AS fabId, 
                    f.name AS fabName, 
                    f.roomNum, 
                    r.id AS roomId, 
                    r.name AS roomName, 
                    r.rackNum, 
                    r.height,
                    rk.id AS rackId,
                    rk.name AS rackName,
                    rk.service,
                    s.name AS severName,
                    s.ip,
                    s.service AS serverService
            FROM fabs f
            LEFT JOIN rooms r ON r.fabId = f.id
            LEFT JOIN racks rk ON rk.roomId = r.id
            LEFT JOIN servers s ON s.rackId = rk.id
            WHERE f.name = $1;
            `;
      const result = await pool.query(query, [name]);
      logger.info({
        message: `msg=All fab's details get`,
      });
      return result;
    } catch (error) {
      logger.error({
        message: `msg=getFabDetails error error=${error}`,
      });
    }
  }

  async getAllRooms(id) {
    try {
      const result = await pool.query('SELECT * FROM Rooms WHERE fabId = $1', [id]);
      logger.info({
        message: `msg=AllRooms get`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=Getall rooms error error=${error}`,
      });
    }
  }

  async getAllFabs() {
    try {
      const result = await pool.query('SELECT * FROM fabs');
      logger.info({
        message: `msg=AllFabs get`,
      });
      return result.rows;
    } catch (error) {
      logger.error({
        message: `msg=Getall fabs error error=${error}`,
      });
    }
  }

  async getFab(id) {
    try {
      const result = await pool.query('SELECT * FROM fabs WHERE id = $1', [id]);
      logger.info({
        message: `msg=Fab get`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Fab get error error=${error}`,
      });
    }
  }

  async createFab(name, roomNum) {
    try {
      const result = await pool.query('INSERT INTO fabs (name, roomNum) VALUES ($1, $2) RETURNING *', [name, roomNum]);
      logger.info({
        message: `msg=Fab created name=${name}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Fab create name=${name} error error=${error}`,
      });
    }
  }

  async updateFab(id, name, roomNum) {
    try {
      const result = await pool.query('UPDATE fabs SET name = $1, roomNum = $2 WHERE id = $3 RETURNING *', [name, roomNum, id]);
      logger.info({
        message: `msg=Fab updated name=${name} roomNum=${roomNum}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Fab update id=${id} error error=${error}`,
      });
    }
  }

  async deleteFab(name) {
    try {
      const result = await pool.query('DELETE FROM fabs WHERE name = $1 RETURNING *', [name]);
      logger.info({
        message: `msg=Fab deleted name=${name}`,
      });
      return result.rows[0];
    } catch (error) {
      logger.error({
        message: `msg=Fab delete name=${name} error error=${error}`,
      });
    }
  }
}
const fabService = new FabServices();

export default fabService;
