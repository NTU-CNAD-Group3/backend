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
        result = this.createIpPool(fabId, service);
      }
      const poolData = result.rows[0];
      const usedIps = poolData.usedIps || [];
      const cidr = poolData.cidr;

      const ip = await ipUtils.getAvailableIp(cidr, usedIps);
      if (!ip) {
        throw new Error('No available IP in the pool');
        // 未來增加擴充機能
      }
      console.log(ip);
      usedIps.push(ip);
      await pool.query(`UPDATE ipPools SET usedIps = $1 WHERE fabId = $2`, [usedIps, fabId]);

      logger.info({
        message: `Assigned IP ${ip} to service=${service} in fabId=${fabId}`,
      });

      return ip;
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
}
const ipService = new IpServices();

export default ipService;
