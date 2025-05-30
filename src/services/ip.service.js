import { pool } from '#src/models/db.js';
import logger from '#src/utils/logger.js';
import ipUtils from '#src/utils/ip.util.js';
class IpServices {
  async assign(client, service) {
    // 找對應 IP pool

    const result = await client.query(`SELECT id FROM ipPools WHERE service = $1`, [service]);
    let poolData;
    let poolId;
    let ip;
    let lockKey;
    for (let i = 0; i < result.rows.length; i++) {
      poolId = result.rows[i].id;
      lockKey = 5000000000000000 + poolId;
      await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
      poolData = (await client.query(`SELECT * FROM ipPools WHERE id = $1`, [poolId])).rows[0];
      ip = await ipUtils.getAvailableIp(poolData.cidr, poolData.usedips);
      if (ip) {
        break;
      }
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
    }

    if (!ip) {
      const error = new Error(`No available IP found for service=${service}`);
      error.status = 503;
      throw error;
    }

    const usedIps = poolData.usedips || [];
    const ipPoolId = poolData.id;

    usedIps.push(ip);
    await client.query(`UPDATE ipPools SET usedIps = $1,updatedAt = NOW() WHERE id = $2 `, [usedIps, ipPoolId]);
    logger.info({
      message: `msg=Assigned IP ${ip} to service=${service}`,
    });
    await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
    return [ip, ipPoolId];
  }

  async createIpPool(service, cidrBlock) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingPools = await client.query(`SELECT cidr FROM ipPools`);
      let overlappingPool = null;
      for (const row of existingPools.rows) {
        const isOverlap = await ipUtils.isOverlap(row.cidr, cidrBlock);
        if (isOverlap) {
          overlappingPool = row;
          break;
        }
      }
      if (overlappingPool) {
        const error = new Error(`CIDR block ${cidrBlock} overlaps with existing pool ${overlappingPool.cidr}`);
        error.status = 503;
        throw error;
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

  async release(client, id) {
    const lockKey = 5000000000000000 + id;
    await client.query(`SELECT pg_advisory_lock($1)`, [lockKey]);
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
    } else {
      throw new Error(`IP ${ip} not found in ip pool`);
    }
    await client.query(`UPDATE ipPools SET usedIps = $1,updatedAt = NOW() WHERE id = $2`, [usedIps, poolData.id]);
    logger.info({
      message: `msg=Released IP ${ip} from server=${serverData.name}`,
    });
    await client.query(`SELECT pg_advisory_unlock($1)`, [lockKey]);
    return ip;
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

  async getIpPool(service) {
    try {
      const result = await pool.query(`SELECT * FROM ipPools WHERE service = $1`, [service]);

      logger.info({
        message: `msg=Get IpPools for service=${service}`,
      });

      return result.rows;
    } catch (error) {
      logger.error({
        message: `IpPool get service=${service} error error=${error.message}`,
      });
      throw error;
    }
  }

  async getAllIpPools() {
    try {
      const result = await pool.query(`SELECT * FROM ipPools`, []);

      logger.info({
        message: `msg=Get all IpPools`,
      });

      return result.rows;
    } catch (error) {
      logger.error({
        message: `All IpPools get error error=${error.message}`,
      });
      throw error;
    }
  }
}

const ipService = new IpServices();

export default ipService;
