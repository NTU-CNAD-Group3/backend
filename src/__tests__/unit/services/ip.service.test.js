import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockClient = {
  query: jest.fn(),
  release: jest.fn(),
};
jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    query: mockQuery,
    connect: jest.fn().mockResolvedValue(mockClient),
  },
  databaseClose: jest.fn().mockResolvedValue(undefined),
}));

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};
jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: mockLogger,
}));

const mockIpUtils = {
  getAvailableIp: jest.fn(),
  getAllIP: jest.fn(),
  isOverlap: jest.fn(),
};
jest.unstable_mockModule('#src/utils/ip.util.js', () => ({
  default: mockIpUtils,
}));

const ipService = (await import('#src/services/ip.service.js')).default;
const { pool } = await import('#src/models/db.js');
const logger = (await import('#src/utils/logger.js')).default;
const ipUtils = (await import('#src/utils/ip.util.js')).default;

describe('Ip Service - Unit test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Ip Service - assign', () => {
    it('should assign an available IP and commit the transaction', async () => {
      const mockServiceName = 'IPTest';
      const mockIp = '10.0.1.2';
      const usedIps1 = Array.from({ length: 256 }, (_, i) => `10.0.0.${i}`);
      const usedIps2 = ['10.0.1.0', '10.0.1.1'];
      const mockusedIPResult = ['10.0.1.0', '10.0.1.1', '10.0.1.2'];
      const mockPoolResult = [
        { id: 1, service: mockServiceName, cidr: '10.0.0.0/24', usedips: usedIps1 },
        { id: 2, service: mockServiceName, cidr: '10.0.1.0/24', usedips: usedIps2 },
      ];

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: mockPoolResult }) // SELECT * FROM ipPools
        .mockResolvedValueOnce({ rows: [{}] }) // UPDATE
        .mockResolvedValueOnce({}); // COMMIT

      mockIpUtils.getAvailableIp
        .mockResolvedValueOnce(null) // First pool returns no IP
        .mockResolvedValueOnce(mockIp); // Second pool returns an IP

      const result = await ipService.assign(mockServiceName);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE service = $1', [mockServiceName]);

      expect(ipUtils.getAvailableIp).toHaveBeenCalledWith(mockPoolResult[0].cidr, mockPoolResult[0].usedips);

      expect(ipUtils.getAvailableIp).toHaveBeenCalledWith(mockPoolResult[1].cidr, mockPoolResult[1].usedips);

      expect(mockClient.query).toHaveBeenCalledWith('UPDATE ipPools SET usedIps = $1 WHERE id = $2 RETURNING *', [
        mockusedIPResult,
        mockPoolResult[1].id,
      ]);

      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Assigned IP ${mockIp} to service=${mockServiceName}`,
      });

      expect(result).toEqual([mockIp, mockPoolResult[1].id]);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and log if no available IP is found', async () => {
      const mockServiceName = 'IPTest';
      const mockError = 'No available IP found for service=IPTest';
      const usedIps1 = Array.from({ length: 256 }, (_, i) => `10.0.0.${i}`);
      const mockPoolResult = [{ id: 1, service: mockServiceName, cidr: '10.0.0.0/24', usedips: usedIps1 }];

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: mockPoolResult }); // SELECT * FROM ipPools

      mockIpUtils.getAvailableIp.mockResolvedValue(null); // No IPs available

      await expect(ipService.assign(mockServiceName)).rejects.toThrow();

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE service = $1', [mockServiceName]);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=IP Assign service=${mockServiceName} error error=${mockError}`),
      });
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('createIpPool', () => {
    it('should insert a new IP pool if no overlap is found', async () => {
      const mockServiceName = 'IPTest';
      const mockCidr = '10.0.0.0/24';
      const existingCidrs = [{ cidr: '10.0.1.0/24' }];

      // Simulate no overlapping pools
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: existingCidrs }) // SELECT cidr FROM ipPools
        .mockResolvedValueOnce({
          // INSERT INTO ipPools
          rows: [
            {
              id: 1,
              service: mockServiceName,
              cidr: mockCidr,
              usedips: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })
        .mockResolvedValueOnce({}); // COMMIT

      mockIpUtils.isOverlap.mockReturnValue(false);

      const result = await ipService.createIpPool(mockServiceName, mockCidr);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT cidr FROM ipPools');
      expect(ipUtils.isOverlap).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO ipPools'), [mockServiceName, mockCidr, []]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=IP pool created for service=${mockServiceName}, cidr=${mockCidr}`,
      });
      expect(result.service).toBe(mockServiceName);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw and rollback if CIDR overlaps with existing pool', async () => {
      const mockServiceName = 'IPTest';
      const mockCidr = '10.0.0.0/24';

      const existingCidrs = [{ cidr: '10.0.0.0/23' }];
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: existingCidrs }); // SELECT

      const mockError = `CIDR block ${mockCidr} overlaps with existing pool ${existingCidrs[0].cidr}`;

      mockIpUtils.isOverlap.mockReturnValue(true);

      await expect(ipService.createIpPool(mockServiceName, mockCidr)).rejects.toThrow(mockError);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=IP pool create service=${mockServiceName}, cidrBlock=${mockCidr} error error=${mockError}`),
      });
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('release', () => {
    it('should remove the IP from usedIps and commit transaction', async () => {
      const mockId = 1;
      const mockIp = '10.0.0.0';
      const mockIpPoolId = 2;
      const mockServerName = 'server1';

      const mockServerResult = {
        rows: [
          {
            id: mockId,
            name: mockServerName,
            ip: mockIp,
            ippoolid: mockIpPoolId,
          },
        ],
      };
      const mockPoolResult = {
        rows: [
          {
            id: mockIpPoolId,
            usedips: ['10.0.0.3', mockIp, '10.0.0.200'],
          },
        ],
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce(mockServerResult) // SELECT * FROM servers
        .mockResolvedValueOnce(mockPoolResult) // SELECT * FROM ipPools
        .mockResolvedValueOnce({}) // UPDATE ipPools
        .mockResolvedValueOnce({}); // COMMIT

      const result = await ipService.release(mockId);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM servers WHERE id = $1', [mockId]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE id = $1', [mockIpPoolId]);
      expect(mockClient.query).toHaveBeenCalledWith('UPDATE ipPools SET usedIps = $1 WHERE id = $2', [
        ['10.0.0.3', '10.0.0.200'],
        mockIpPoolId,
      ]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Released IP ${mockIp} from server=${mockServerName}`,
      });
      expect(result).toBe(mockIp);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and throw if server is not found', async () => {
      const mockId = 1;
      const mockError = 'Server not found';
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // SELECT * FROM servers

      await expect(ipService.release(mockId)).rejects.toThrow(mockError);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM servers WHERE id = $1', [mockId]);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=IP release id=${mockId} error error=${mockError}`),
      });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and throw if IP pool not found', async () => {
      const mockId = 1;
      const mockIp = '10.0.0.0';
      const mockIpPoolId = 2;
      const mockServerName = 'server1';
      const mockError = 'No IP pool found for the given ipPoolId';

      const mockServerResult = {
        rows: [
          {
            id: mockId,
            name: mockServerName,
            ip: mockIp,
            ippoolid: mockIpPoolId,
          },
        ],
      };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce(mockServerResult) // SELECT * FROM servers
        .mockResolvedValueOnce({ rows: [] }); // SELECT * FROM ipPools

      await expect(ipService.release(1)).rejects.toThrow(mockError);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM servers WHERE id = $1', [mockId]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE id = $1', [mockIpPoolId]);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=IP release id=${mockId} error error=${mockError}`),
      });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback and throw if IP not found in pool', async () => {
      const mockId = 1;
      const mockIp = '10.0.0.5';
      const mockIpPoolId = 2;
      const mockServerName = 'server1';
      const mockError = `IP ${mockIp} not found in ip pool`;

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockId,
              name: mockServerName,
              ip: mockIp,
              ippoolid: mockIpPoolId,
            },
          ],
        }) // SELECT * FROM servers
        .mockResolvedValueOnce({
          rows: [
            {
              id: mockIpPoolId,
              usedips: ['10.0.0.1', '10.0.0.100'], // No '10.0.0.5'
            },
          ],
        }); // SELECT * FROM ipPools

      await expect(ipService.release(mockId)).rejects.toThrow(mockError);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM servers WHERE id = $1', [mockId]);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE id = $1', [mockIpPoolId]);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=IP release id=${mockId} error error=${mockError}`),
      });
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getAllIp', () => {
    it('should return all IPs from multiple cidr blocks', async () => {
      const mockServiceName = 'IPTest';
      const mockRows = [{ cidr: '10.0.0.0/24' }, { cidr: '10.0.2.0/24' }];
      const mockIps1 = ['10.0.0.0', '10.0.0.1'];
      const mockIps2 = ['10.0.2.1', '10.0.2.2', '10.0.2.3'];

      mockQuery.mockResolvedValueOnce({ rows: mockRows });
      mockIpUtils.getAllIP.mockResolvedValueOnce(mockIps1).mockResolvedValueOnce(mockIps2);

      const result = await ipService.getAllIp(mockServiceName);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE service = $1', [mockServiceName]);
      expect(ipUtils.getAllIP).toHaveBeenCalledWith('10.0.0.0/24');
      expect(ipUtils.getAllIP).toHaveBeenCalledWith('10.0.2.0/24');
      expect(result).toEqual([...mockIps1, ...mockIps2]);
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Get all IPs for service=${mockServiceName}`,
      });
    });
  });

  describe('getUsedIp', () => {
    it('should return all used IPs from all matching pools', async () => {
      const mockServiceName = 'IPTest';
      const mockRows = [{ usedips: ['10.0.0.1', '10.0.0.2'] }, { usedips: ['10.0.1.2'] }];

      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const result = await ipService.getUsedIp(mockServiceName);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE service = $1', [mockServiceName]);
      expect(result).toEqual(['10.0.0.1', '10.0.0.2', '10.0.1.2']);
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Get used IPs for service=${mockServiceName}`,
      });
    });
  });

  describe('getIpPool', () => {
    it('should return IpPools from all matching pools', async () => {
      const mockServiceName = 'IPTest';
      const usedIps1 = Array.from({ length: 256 }, (_, i) => `10.0.0.${i}`);
      const usedIps2 = ['10.0.1.0', '10.0.1.1'];
      const mockPoolResult = [
        { id: 1, service: mockServiceName, cidr: '10.0.0.0/24', usedips: usedIps1 },
        { id: 2, service: mockServiceName, cidr: '10.0.1.0/24', usedips: usedIps2 },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockPoolResult });

      const result = await ipService.getIpPool(mockServiceName);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM ipPools WHERE service = $1', [mockServiceName]);
      expect(result).toEqual({ rows: mockPoolResult });
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Get IpPools for service=${mockServiceName}`,
      });
    });
  });

  describe('getAllIpPools', () => {
    it('should return all IpPools from all matching pools', async () => {
      const usedIps1 = Array.from({ length: 256 }, (_, i) => `10.0.0.${i}`);
      const usedIps2 = ['10.0.1.0', '10.0.1.1'];
      const mockPoolResult = [
        { id: 1, service: 'IPTest', cidr: '10.0.0.0/24', usedips: usedIps1 },
        { id: 2, service: 'IPTest2', cidr: '10.0.1.0/24', usedips: usedIps2 },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockPoolResult });

      const result = await ipService.getAllIpPools();

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM ipPools', []);
      expect(result).toEqual({ rows: mockPoolResult });
      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Get all IpPools`,
      });
    });
  });
});
