import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import ipUtils from '#src/utils/ip.util.js';
class IpServices {
  async assign(service) {
    // 有server加入
    const client = await pool.connect();
    try {
      // 找對應 IP pool
      await client.query('BEGIN');
      const result = await client.query(`SELECT * FROM ipPools WHERE service = $1`, [service]);
      let poolData;
      let ip;
      for (let i = 0; i < result.rows.length; i++) {
        poolData = result.rows[i];
        ip = await ipUtils.getAvailableIp(poolData.cidr, poolData.usedips);
        if (ip) {
          break;
        }
      }

      if (!ip) {
        throw new Error(`No available IP found for service=${service}`);
      }

      const usedIps = poolData.usedips || [];
      const ipPoolId = poolData.id;

      usedIps.push(ip);
      await client.query(`UPDATE ipPools SET usedIps = $1 WHERE id = $2 RETURNING *`, [usedIps, ipPoolId]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Assigned IP ${ip} to service=${service}`,
      });

      return [ip, ipPoolId];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=IP Assign service=${service} error error=${error.message}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async createIpPool(service, cidrBlock) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingPools = await client.query(`SELECT cidr FROM ipPools`);
      const overlappingPool = existingPools.rows.find(row =>
        ipUtils.isOverlap(row.cidr, cidrBlock)
      );

      if (overlappingPool) {
        throw new Error(`CIDR block ${cidrBlock} overlaps with existing pool ${overlappingPool.cidr}`);
      }

      const insertQuery = `
        INSERT INTO ipPools (service, cidr, usedIps) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
      const insertResult = await client.query(insertQuery, [service, cidrBlock, []]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=IP pool created for service=${service}, cidr=${cidrBlock}`,
      });

      return insertResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=IP pool create service=${service}, cidrBlock=${cidrBlock} error error=${error.message}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async release(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const serverResult = await client.query(`SELECT * FROM servers WHERE id = $1`, [id]);
      if (serverResult.rows.length === 0) {
        throw new Error(`Server not found`);
      }
      const serverData = serverResult.rows[0];
      const ipPoolId = serverData.ippoolid;
      const ipPoolsResult = await client.query(`SELECT * FROM ipPools WHERE id = $1`, [ipPoolId]);
      if (ipPoolsResult.rows.length === 0) {
        throw new Error('No IP pool found for the given ipPoolId');
      }

      const ip = serverData.ip;
      const poolData = ipPoolsResult.rows[0];
      const usedIps = poolData.usedips || [];

      const index = usedIps.indexOf(ip);
      if (index !== -1) {
        usedIps.splice(index, 1);
      }
      else {
        throw new Error(`IP ${ip} not found in ip pool`);
      }
      await client.query(`UPDATE ipPools SET usedIps = $1 WHERE id = $2`, [usedIps, poolData.id]);
      await client.query('COMMIT');
      logger.info({
        message: `msg=Released IP ${ip} from server=${serverData.name}`,
      });

      return ip;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=IP release id=${id} error error=${error.message}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllIp(service) {
    try {
      const result = await pool.query('SELECT * FROM ipPools WHERE service = $1', [service]);
  
      let allIps = [];
      for (const row of result.rows) {
        const cidr = row.cidr;
        const ips = await ipUtils.getAllIP(cidr);
        allIps = allIps.concat(ips);
      }

      logger.info({
        message: `msg=Get all IPs for service=${service}`,
      });
  
      return allIps;
    } catch (error) {
      logger.error({
        message: `msg=AllIP get service=${service} error: ${error.message}`,
        stack: error.stack,
      });
      throw error;
    }
  }
  

  async getUsedIp(service) {
    try {
      const result = await pool.query(`SELECT * FROM ipPools WHERE service = $1`, [service]);
      if (result.rows.length === 0) {
        throw new Error(`No IP pool found for service=${service}`);
      }

      let usedIps = [];
      for (const row of result.rows) {
        const ips = row.usedips;
        usedIps = usedIps.concat(ips);
      }

      logger.info({
        message: `msg=Get used IPs for service=${service}`,
      });

      
      return usedIps;
    } catch (error) {
      logger.error({
        message: `UsedIP get service=${service} error error=${error.message}`,
      });
      throw error;
    }
  }
}
const ipService = new IpServices();

export default ipService;
