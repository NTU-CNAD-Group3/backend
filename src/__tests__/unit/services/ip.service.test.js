import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockRelease = jest.fn();
const mockConnect = jest.fn(() => Promise.resolve({ query: mockQuery, release: mockRelease }));

jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: { connect: mockConnect, query: mockQuery },
}));

jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.unstable_mockModule('#src/utils/ip.util.js', () => ({
  default: {
    getAvailableIp: jest.fn(),
    isOverlap: jest.fn(),
    getAllIP: jest.fn(),
  },
}));

const { default: ipService } = await import('#src/services/ip.service.js');
const ipUtils = (await import('#src/utils/ip.util.js')).default;
beforeEach(() => {
  jest.clearAllMocks();
});

describe('IpServices', () => {
  describe('assign', () => {
    it('assigns IP successfully', async () => {
      const client = { query: jest.fn() };
      client.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({}) // lock
        .mockResolvedValueOnce({ rows: [{ id: 1, cidr: '192.168.0.0/30', usedips: [] }] })
        .mockResolvedValueOnce({}) // update
        .mockResolvedValueOnce({}); // unlock

      ipUtils.getAvailableIp.mockResolvedValue('192.168.0.1');

      const [ip, poolId] = await ipService.assign(client, 'service1');
      expect(ip).toBe('192.168.0.1');
      expect(poolId).toBe(1);
    });

    it('throws error if no IP available', async () => {
      const client = { query: jest.fn() };
      client.query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1, cidr: '10.0.0.0/30', usedips: ['10.0.0.1'] }] })
        .mockResolvedValueOnce({});

      ipUtils.getAvailableIp.mockResolvedValue(null);

      const err = await ipService.assign(client, 'test').catch((e) => e);
      expect(err.status).toBe(503);
    });
  });

  describe('createIpPool', () => {
    it('creates a new pool successfully', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      mockConnect.mockResolvedValueOnce(mockClient);
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // SELECT cidr FROM ipPools
        .mockResolvedValueOnce({ rows: [{ id: 1, cidr: '192.168.1.0/24' }] }) // INSERT INTO ipPools...
        .mockResolvedValueOnce(); // COMMIT

      ipUtils.isOverlap.mockReturnValue(false);

      const pool = await ipService.createIpPool('svc', '192.168.1.0/24');
      expect(pool.id).toBe(1);
    });

    it('throws error if CIDR overlaps', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      mockConnect.mockResolvedValueOnce(mockClient);
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce({ rows: [{ cidr: '192.168.1.0/24' }] }) // SELECT cidr FROM ipPools
        .mockResolvedValueOnce(); // ROLLBACK (會因錯誤執行)
      ipUtils.isOverlap.mockReturnValue(true);

      await expect(ipService.createIpPool('svc', '192.168.1.0/24')).rejects.toThrow(/overlaps/);
    });
  });

  describe('release', () => {
    it('releases IP successfully', async () => {
      const client = { query: jest.fn() };
      client.query
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({ rows: [{ id: 1, ip: '10.0.0.1', ippoolid: 2, name: 'srv' }] })
        .mockResolvedValueOnce({ rows: [{ id: 2, usedips: ['10.0.0.1'] }] })
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const ip = await ipService.release(client, 1);
      expect(ip).toBe('10.0.0.1');
    });
  });

  describe('getAllIp', () => {
    it('returns all IPs', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ cidr: '192.168.1.0/30' }] });
      ipUtils.getAllIP.mockResolvedValueOnce(['192.168.1.1', '192.168.1.2']);

      const ips = await ipService.getAllIp('svc');
      expect(ips.length).toBe(2);
    });
  });

  describe('getUsedIp', () => {
    it('returns used IPs', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ usedips: ['192.168.0.1'] }] });
      const ips = await ipService.getUsedIp('svc');
      expect(ips).toContain('192.168.0.1');
    });
  });

  describe('getIpPool', () => {
    it('returns IP pool', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      const result = await ipService.getIpPool('svc');
      expect(result[0].id).toBe(1);
    });
  });

  describe('getAllIpPools', () => {
    it('returns all IP pools', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }, { id: 2 }] });
      const result = await ipService.getAllIpPools();
      expect(result.rows.length).toBe(2);
    });
  });
});
