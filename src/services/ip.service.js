import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import ipUtils from '#src/utils/ip.util.js';
class IpServices {
  async assign(fabId, service) {
    // 有server加入
    try {
      // 找對應 IP pool
      let result = await pool.query(`SELECT * FROM ipPools WHERE fabId = $1 AND service = $2`, [fabId, service]);
      if (result.rows.length === 0) {
        // 沒找到則創建
        const newipPool = await this.createIpPool(fabId, service);
        result.rows = [newipPool];
      }

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

      const usedIps = poolData.usedIps || [];
      const ipPoolId = poolData.id;

      console.log(ip);
      usedIps.push(ip);
      await pool.query(`UPDATE ipPools SET usedIps = $1 WHERE id = $2`, [usedIps, ipPoolId]);

      logger.info({
        message: `Assigned IP ${ip} to service=${service} in fabId=${fabId}`,
      });

      return [ ip, ipPoolId ];
    } catch (error) {
      logger.error({
        message: `msg=Assigned IP error=${error.message}`,
      });
      throw error;
    }
  }

  async createIpPool(fabId, service) {
    try {
      const selectQuery = `SELECT cidr FROM ipPools WHERE fabId = $1`;
      const result = await pool.query(selectQuery, [fabId]);

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
      const insertResult = await pool.query(insertQuery, [fabId, service, cidrBlock, []]);

      logger.info({
        message: `IP pool created for fabId=${fabId}, service=${service}, cidr=${cidrBlock}`,
      });

      return insertResult.rows[0];
    } catch (error) {
      logger.error({
        message: `Error creating IP pool for fabId=${fabId}, service=${service}: ${error.message}`,
      });
      throw error;
    }
  }

  async release(fabId, server) {
    try {
      let serverResult = await pool.query(`SELECT * FROM servers WHERE fabId = $1 AND name = $2`, [fabId, server]);
      if (serverResult.rows.length === 0) {
        throw new Error(`Server not found: ${server}`);
      }
      const serverData = serverResult.rows[0];
      const ipPoolId = serverData.ipPoolId;
      let ipPoolsResult = await pool.query(`SELECT * FROM ipPools WHERE fabId = $1 AND id = $2`, [fabId, ipPoolId]);
      if (ipPoolsResult.rows.length === 0) {
        throw new Error('No IP pool found for the given fabId');
      }
      
      const ip = serverData.ip;
      const poolData = ipPoolsResult.rows[0];
      const usedIps = poolData.usedIps || [];

      const index = usedIps.indexOf(ip);
      if (index !== -1) {
        usedIps.splice(index, 1);
      }
      await pool.query(`UPDATE ipPools SET usedIps = $1 WHERE id = $2`, [usedIps, poolData.id]);

      logger.info({
        message: `Released IP ${ip} from server=${server} in fabId=${fabId}`,
      });

      return ip;
    } catch (error) {
      logger.error({
        message: `Error releasing IP for fabId=${fabId}, server=${server}: ${error.message}`,
      });
      throw error;
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

      const usedIps = result.rows[0].usedIps || [];
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
