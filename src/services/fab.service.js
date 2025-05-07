import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
class FabServices {
  // async getFabDetails(name) {
  //   try {
  //     // 可以自己改要印出甚麼記得名子衝突要重新用AS命名
  //     // 也可以同時多張表，利用多個LEFT JOIN
  //     const query = `
  //           SELECT  f.id AS fabId,
  //                   f.name AS fabName,
  //                   f.roomNum,
  //                   r.id AS roomId,
  //                   r.name AS roomName,
  //                   r.rackNum,
  //                   r.height,
  //                   rk.id AS rackId,
  //                   rk.name AS rackName,
  //                   rk.service,
  //                   s.name AS severName,
  //                   s.ip,
  //                   s.service AS serverService
  //           FROM fabs f
  //           LEFT JOIN rooms r ON r.fabId = f.id
  //           LEFT JOIN racks rk ON rk.roomId = r.id
  //           LEFT JOIN servers s ON s.rackId = rk.id
  //           WHERE f.name = $1;
  //           `;
  //     const result = await pool.query(query, [name]);
  //     logger.info({
  //       message: `msg=All fab's details get`,
  //     });
  //     return result;
  //   } catch (error) {
  //     logger.error({
  //       message: `msg=getFabDetails error error=${error}`,
  //     });
  //   }
  // }

  // async getAllRooms(id) {
  //   try {
  //     const result = await pool.query('SELECT * FROM Rooms WHERE fabId = $1', [id]);
  //     logger.info({
  //       message: `msg=AllRooms get`,
  //     });
  //     return result.rows;
  //   } catch (error) {
  //     logger.error({
  //       message: `msg=Getall rooms error error=${error}`,
  //     });
  //   }
  // }

  async getFab(id) {
    const inTable =await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE id = $1)', [id]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: `msg=Fab not found` });
      const error = new Error('DC not found');
      error.status = 404;
      throw error;
    }
    const query = ` 
      SELECT 
        dc.id AS dc_id, dc.name AS dc_name,dc.createdAt,dc.updatedAt,
        r.id AS room_id, r.name AS room_name,
        rk.id AS rack_id, rk.name AS rack_name, rk.service,
        s.id AS server_id, s.name AS server_name
      FROM fabs dc
      LEFT JOIN rooms r ON r.fabId = dc.id
      LEFT JOIN racks rk ON rk.roomId = r.id
      LEFT JOIN servers s ON s.rackId = rk.id
      WHERE dc.id = $1
      ORDER BY dc.id, r.id, rk.id, s.id
    `;
    const { rows } = await pool.query(query, [id]);
    const result = {
      name: '',
      roomNum: 0,
      createdAt: null,
      updatedAt: null,
      rooms: {},
    };

    for (const row of rows) {
      if (!result.name) {
        result.name = row.dc_name;
        result.createdAt = row.createdat;
        result.updatedAt = row.updatedat;
      }
      if (row.room_id) {
        const roomKey = `room${row.room_id}`;
        if (!result.rooms[roomKey]) {
          result.roomNum++;
          result.rooms[roomKey] = {
            name: row.room_name,
            rackNum: 0,
            racks: {},
          };
        }
    
        const room = result.rooms[roomKey];
    
        // Only if there is a rack
        if (row.rack_id) {
          const rackKey = `rack${row.rack_id}`;
          if (!room.racks[rackKey]) {
            room.rackNum++;
            room.racks[rackKey] = {
              name: row.rack_name,
              service: row.service,
              serverNum: 0,
              servers: {},
            };
          }
    
          const rack = room.racks[rackKey];
    
          // Only if there is a server
          if (row.server_id) {
            const serverKey = `server${row.server_id}`;
            rack.serverNum++;
            rack.servers[serverKey] = {
              name: row.server_name,
            };
          }
        }
      }
      
    }

    logger.info({ message: `msg=Fab get` });
    return result;
  }

  async getAllFabs() {
    const query = ` 
      SELECT 
        dc.id AS dc_id, dc.name AS dc_name,
        r.id AS room_id, r.name AS room_name,
        rk.id AS rack_id, rk.name AS rack_name, rk.service,
        s.id AS server_id, s.name AS server_name, s.unit, s.frontPosition , s.backPosition
      FROM fabs dc
      LEFT JOIN rooms r ON r.fabId = dc.id
      LEFT JOIN racks rk ON rk.roomId = r.id
      LEFT JOIN servers s ON s.rackId = rk.id
      ORDER BY dc.id, r.id, rk.id, s.id
    `;

    const { rows } = await pool.query(query);
    const result = {};

    if (rows.length === 0) {
      // If no fabs are found, return empty result
      return result;
    }
  
    // If fabs exist but no rooms, racks, or servers
    let lastDcKey = null;
  
    for (const row of rows) {
      const dcKey = `dc${row.dc_id}`;
      const roomKey = `room${row.room_id}`;
      const rackKey = `rack${row.rack_id}`;
      const serverKey = `server${row.server_id}`;
  
      if (!result[dcKey]) {
        result[dcKey] = {
          name: row.dc_name,
          roomNum: 0,
          rooms: {},
        };
        lastDcKey = dcKey; // Track the last DC key added
      }
  
      const dc = result[dcKey];
  
      if (row.room_id) {
        if (!dc.rooms[roomKey]) {
          dc.roomNum++;
          dc.rooms[roomKey] = {
            name: row.room_name,
            rackNum: 0,
            racks: {},
          };
        }
  
        const room = dc.rooms[roomKey];
  
        if (row.rack_id) {
          if (!room.racks[rackKey]) {
            room.rackNum++;
            room.racks[rackKey] = {
              name: row.rack_name,
              service: row.service,
              serverNum: 0,
              servers: {},
            };
          }
  
          const rack = room.racks[rackKey];
  
          if (row.server_id) {
            rack.serverNum++;
            rack.servers[serverKey] = {
              name: row.server_name,
              unit: row.unit,
              position_front: row.frontposition,
              position_back: row.backposition,
            };
          }
        }
      }
    }
  
    // Ensure that if there are no rooms, racks, or servers for the last fab, it's still included
    if (lastDcKey) {
      const lastFab = result[lastDcKey];
      if (lastFab.roomNum === 0) {
        lastFab.rooms = {}; // Ensure empty rooms if no rooms/racks/servers exist
      }
    }

    logger.info({ message: `msg=All fabs get` });
    return result;
  }

  async createFab(name) {
    const inTable =await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [name]);
    if (inTable.rows[0].exists) {
      logger.error({ message: `msg=The name must be unique` });
      const error = new Error('The name must be unique');
      error.status = 400;
      throw error;
    }
    const roomNum=0;
    const result = await pool.query('INSERT INTO fabs (name, roomNum) VALUES ($1, $2) RETURNING id', [name, roomNum]);
    logger.info({
      message: `msg=Fab created name=${name}`,
    });
    return result.rows[0];
  }

  async updateFab(id, name, roomNum) {
    const inTable =await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE id = $1)', [id]);
    if (!inTable.rows[0].exists) {
      logger.error({ message: 'msg=Fab not found' });
      const error = new Error('DC not found');
      error.status = 404;
      throw error;
    }
    const naming =await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [name]);
    if (naming.rows[0].exists) {
      logger.error({ message: 'msg=The name must be unique' });
      const error = new Error('The name must be unique');
      error.status = 400;
      throw error;
    }
    await pool.query('UPDATE fabs SET name = $1, roomNum = $2 WHERE id = $3', [name, roomNum, id]);
    logger.info({
      message: `msg=Fab updated name=${name} roomNum=${roomNum}`,
    });
  }

  async deleteFab(name) {
    const naming =await pool.query('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [name]);
    if (!naming.rows[0].exists) {
      logger.error({ message: 'msg=Fab not found' });
      const error = new Error('The name does not exist');
      error.status = 400;
      throw error;
    }
    await pool.query('DELETE FROM fabs WHERE name = $1', [name]);
    logger.info({
      message: `msg=Fab deleted name=${name}`,
    });
  }
}
const fabService = new FabServices();

export default fabService;
