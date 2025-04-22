import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import ipUtils from '#src/utils/ip.util.js';
class IpServices {
  async assign(fabId, service) {
    // 有server加入
    const client = await pool.connect();
    try {
      // 找對應 IP pool
      await client.query('BEGIN');
      const result = await client.query(`SELECT * FROM ipPools WHERE fabId = $1 AND service = $2`, [fabId, service]);
      let poolData;
      let ip;
      for (let i = 0; i < result.rows.length; i++) {
        poolData = result.rows[i];
        ip = await ipUtils.getAvailableIp(poolData.cidr, poolData.usedIps);
        if (ip) {
          break;
        }
      }

      if (!ip) {
        poolData = await this.createIpPool(fabId, service);
        ip = await ipUtils.getAvailableIp(poolData.cidr, poolData.usedIps);
      }

      const usedIps = poolData.usedips || [];
      const ipPoolId = poolData.id;

      console.log(ip);
      usedIps.push(ip);
      await client.query(`UPDATE ipPools SET usedIps = $1 WHERE id = $2 RETURNING *`, [usedIps, ipPoolId]);
      await client.query('COMMIT');
      logger.info({
        message: `Assigned IP ${ip} to service=${service} in fabId=${fabId}`,
      });

      return [ip, ipPoolId];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `msg=Assigned IP error=${error.message}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async createIpPool(fabId, service) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const selectQuery = `SELECT cidr FROM ipPools WHERE fabId = $1`;
      const result = await client.query(selectQuery, [fabId]);

      // 目前是用最暴力的方法找最大，可能可以有更好的方法
      const usedOffsets = result.rows.map((row) => {
        const cidrParts = row.cidr.split('/');
        const ipParts = cidrParts[0].split('.');
        return parseInt(ipParts[2], 10);
      });

      const offset = usedOffsets.length ? Math.max(...usedOffsets) + 1 : 0;
      const cidrBlock = `10.${fabId % 256}.${offset % 256}.0/24`;
      const insertQuery = `
        INSERT INTO ipPools (fabId, service, cidr, usedIps) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *`;
      const insertResult = await client.query(insertQuery, [fabId, service, cidrBlock, []]);
      await client.query('COMMIT');
      logger.info({
        message: `IP pool created for fabId=${fabId}, service=${service}, cidr=${cidrBlock}`,
      });

      return insertResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `Error creating IP pool for fabId=${fabId}, service=${service}: ${error.message}`,
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
      const ipPoolsResult = await client.query(`SELECT * FROM ipPools WHERE fabId = $1 AND id = $2`, [serverData.fabid, ipPoolId]);
      if (ipPoolsResult.rows.length === 0) {
        throw new Error('No IP pool found for the given fabId');
      }

      const ip = serverData.ip;
      const poolData = ipPoolsResult.rows[0];
      const usedIps = poolData.usedips || [];

      const index = usedIps.indexOf(ip);
      if (index !== -1) {
        usedIps.splice(index, 1);
      }
      await client.query(`UPDATE ipPools SET usedIps = $1 WHERE id = $2`, [usedIps, poolData.id]);
      await client.query('COMMIT');
      logger.info({
        message: `Released IP ${ip} from server=${serverData.name} in fabId=${serverData.fabid}`,
      });

      return ip;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error({
        message: `Error releasing IP : ${error.message}`,
      });
      throw error;
    } finally {
      client.release();
    }
  }

  async getAllIp(service) {
    try {
      const result = await pool.query(`SELECT * FROM ipPools WHERE service = $1`, [service]);
      if (result.rows.length === 0) {
        throw new Error(`No IP pool found for service=${service}`);
      }

      const cidr = result.rows[0].cidr;
      const allIps = await ipUtils.getAllIP(cidr);
      return allIps;
    } catch (error) {
      logger.error({
        message: `Error getting all IPs for service=${service}: ${error.message}`,
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

      const usedIps = result.rows[0].usedips || [];
      console.log(usedIps);
      return usedIps;
    } catch (error) {
      logger.error({
        message: `Error getting used IPs for service=${service}: ${error.message}`,
      });
      throw error;
    }
  }
}
const ipService = new IpServices();

export default ipService;
