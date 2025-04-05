import db from '../models/db.js';
import logger from '../utils/logger.js';
class AdminServices {
  async getAllFabs() {
    try {
      const result = await db.query('SELECT * FROM fabs');
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

  async getFab(name) {
    try {
      const result = await db.query('SELECT * FROM fabs WHERE name = $1', [name]);
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
      const result = await db.query('INSERT INTO fabs (name, roomNum) VALUES ($1, $2) RETURNING *', [name, roomNum]);
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
      const result = await db.query('UPDATE fabs SET name = $1, roomNum = $2 WHERE id = $3 RETURNING *', [name, roomNum, id]);
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
      const result = await db.query('DELETE FROM fabs WHERE name = $1 RETURNING *', [name]);
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
const adminService = new AdminServices();

export default adminService;
