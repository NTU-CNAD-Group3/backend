import { jest } from '@jest/globals';

const mockAssign = jest.fn();
const mockCreateIpPool = jest.fn();
const mockRelease = jest.fn();
const mockGetAllIp = jest.fn();
const mockGetUsedIp = jest.fn();
const mockGetIpPool = jest.fn();
const mockGetAllIpPools = jest.fn();

await jest.unstable_mockModule('#src/services/ip.service.js', () => ({
  default: {
    assign: mockAssign,
    createIpPool: mockCreateIpPool,
    release: mockRelease,
    getAllIp: mockGetAllIp,
    getUsedIp: mockGetUsedIp,
    getIpPool: mockGetIpPool,
    getAllIpPools: mockGetAllIpPools,
  },
}));

const {
  assignController,
  createIpPoolController,
  releaseController,
  getAllIpController,
  getUsedIpController,
  getIpPoolController,
  getAllIpPoolsController,
} = await import('#src/controllers/ip.controller.js');

const ipService = (await import('#src/services/ip.service.js')).default;

const getMockReqRes = () => {
  const mockReq = {
    params: {},
    query: {},
    body: {},
  };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
  return { mockReq, mockRes };
};

describe('IP Controllers - Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    ({ mockReq, mockRes } = getMockReqRes());
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignController', () => {
    it('should return assigned IP on success', async () => {
      const mockIp = ['10.0.0.1'];
      mockReq.body = { service: 'IPTest' };
      mockAssign.mockResolvedValue(mockIp);

      await assignController(mockReq, mockRes);

      expect(ipService.assign).toHaveBeenCalledTimes(1);
      expect(ipService.assign).toHaveBeenCalledWith('IPTest');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockIp, message: 'Assigned' });
    });

    it('should throw 400 if service is missing', async () => {
      mockReq.body = {};
      await expect(assignController(mockReq, mockRes)).rejects.toThrow('Service are required');
    });
  });

  describe('createIpPoolController', () => {
    it('should return created pool on success', async () => {
      const mockPool = ['10.0.0.0/24'];
      mockReq.body = { service: 'IPTest', cidrBlock: '10.0.0.0/24' };
      mockCreateIpPool.mockResolvedValue(mockPool);

      await createIpPoolController(mockReq, mockRes);

      expect(ipService.createIpPool).toHaveBeenCalledTimes(1);
      expect(ipService.createIpPool).toHaveBeenCalledWith('IPTest', '10.0.0.0/24');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: mockPool, message: 'Created' });
    });

    it('should throw 400 if params missing', async () => {
      mockReq.body = {};
      await expect(createIpPoolController(mockReq, mockRes)).rejects.toThrow('Service, cidrBlock are required');
    });
  });

  describe('releaseController', () => {
    it('should release IP on success', async () => {
      const released = '10.0.0.1';
      mockReq.params = { id: '123' };
      mockRelease.mockResolvedValue(released);

      await releaseController(mockReq, mockRes);

      expect(ipService.release).toHaveBeenCalledTimes(1);
      expect(ipService.release).toHaveBeenCalledWith('123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: released, message: 'Released' });
    });

    it('should throw 400 if ID missing', async () => {
      mockReq.params = {};
      await expect(releaseController(mockReq, mockRes)).rejects.toThrow('Server ID are required');
    });
  });

  describe('getAllIpController', () => {
    it('should return all IPs', async () => {
      const allIps = ['10.0.0.1'];
      mockReq.query = { service: 'IPTest' };
      mockGetAllIp.mockResolvedValue(allIps);

      await getAllIpController(mockReq, mockRes);

      expect(ipService.getAllIp).toHaveBeenCalledTimes(1);
      expect(ipService.getAllIp).toHaveBeenCalledWith('IPTest');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: allIps, message: 'OK' });
    });

    it('should throw 400 if service missing', async () => {
      mockReq.query = {};
      await expect(getAllIpController(mockReq, mockRes)).rejects.toThrow('Service are required');
    });
  });

  describe('getUsedIpController', () => {
    it('should return used IPs', async () => {
      const usedIps = ['10.0.0.2'];
      mockReq.query = { service: 'IPTest' };
      mockGetUsedIp.mockResolvedValue(usedIps);

      await getUsedIpController(mockReq, mockRes);

      expect(ipService.getUsedIp).toHaveBeenCalledTimes(1);
      expect(ipService.getUsedIp).toHaveBeenCalledWith('IPTest');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: usedIps, message: 'OK' });
    });

    it('should throw 400 if service missing', async () => {
      mockReq.query = {};
      await expect(getUsedIpController(mockReq, mockRes)).rejects.toThrow('Service are required');
    });
  });

  describe('getIpPoolController', () => {
    it('should return used IPs', async () => {
      const IpPools = ['10.0.0.0/24', '10.0.1.0/24'];
      mockReq.query = { service: 'IPTest' };

      mockGetIpPool.mockResolvedValue(IpPools);

      await getIpPoolController(mockReq, mockRes);

      expect(ipService.getIpPool).toHaveBeenCalledTimes(1);
      expect(ipService.getIpPool).toHaveBeenCalledWith('IPTest');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: IpPools, message: 'OK' });
    });

    it('should throw 400 if service missing', async () => {
      mockReq.query = {};
      await expect(getIpPoolController(mockReq, mockRes)).rejects.toThrow('Service are required');
    });
  });

  describe('getAllIpPoolsController', () => {
    it('should return used IPs', async () => {
      const IpPools = ['10.0.0.0/24', '10.0.1.0/24'];

      mockGetAllIpPools.mockResolvedValue(IpPools);

      await getAllIpPoolsController(mockReq, mockRes);

      expect(ipService.getAllIpPools).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: IpPools, message: 'OK' });
    });
  });
});