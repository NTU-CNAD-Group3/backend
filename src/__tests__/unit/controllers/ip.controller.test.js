import { jest } from '@jest/globals';

const mockCreateIpPool = jest.fn();
const mockGetAllIp = jest.fn();
const mockGetUsedIp = jest.fn();
const mockGetIpPool = jest.fn();
const mockGetAllIpPools = jest.fn();

await jest.unstable_mockModule('#src/services/ip.service.js', () => ({
  default: {
    createIpPool: mockCreateIpPool,
    getAllIp: mockGetAllIp,
    getUsedIp: mockGetUsedIp,
    getIpPool: mockGetIpPool,
    getAllIpPools: mockGetAllIpPools,
  },
}));

const { createIpPoolController, getAllIpController, getUsedIpController, getIpPoolController, getAllIpPoolsController } = await import(
  '#src/controllers/ip.controller.js'
);

let req, res;
beforeEach(() => {
  req = { body: {}, query: {}, params: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// createIpPoolController -----------------------------------------------------
// ---------------------------------------------------------------------------
describe('createIpPoolController', () => {
  test('should create IP pool and return 201', async () => {
    const result = { id: 1, service: 'db', cidrBlock: '10.0.0.0/24' };
    mockCreateIpPool.mockResolvedValue(result);

    req.body = { service: 'db', cidrBlock: '10.0.0.0/24' };
    await createIpPoolController(req, res);

    expect(mockCreateIpPool).toHaveBeenCalledWith('db', '10.0.0.0/24');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: result, message: 'Created' });
  });

  test('should throw 400 if service or cidrBlock is missing', async () => {
    req.body = { service: null, cidrBlock: null };

    await expect(createIpPoolController(req, res)).rejects.toThrow('Service, cidrBlock are required');
    expect(mockCreateIpPool).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getAllIpController ---------------------------------------------------------
// ---------------------------------------------------------------------------
describe('getAllIpController', () => {
  test('should return all IPs for service', async () => {
    const result = ['10.0.0.1', '10.0.0.2'];
    mockGetAllIp.mockResolvedValue(result);

    req.query = { service: 'web' };
    await getAllIpController(req, res);

    expect(mockGetAllIp).toHaveBeenCalledWith('web');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: result, message: 'OK' });
  });

  test('should throw 400 if service is missing', async () => {
    req.query = {};

    await expect(getAllIpController(req, res)).rejects.toThrow('Service are required');
    expect(mockGetAllIp).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getUsedIpController --------------------------------------------------------
// ---------------------------------------------------------------------------
describe('getUsedIpController', () => {
  test('should return used IPs for service', async () => {
    const result = ['10.0.0.5'];
    mockGetUsedIp.mockResolvedValue(result);

    req.query = { service: 'web' };
    await getUsedIpController(req, res);

    expect(mockGetUsedIp).toHaveBeenCalledWith('web');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: result, message: 'OK' });
  });

  test('should throw 400 if service is missing', async () => {
    req.query = {};

    await expect(getUsedIpController(req, res)).rejects.toThrow('Service are required');
    expect(mockGetUsedIp).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getIpPoolController --------------------------------------------------------
// ---------------------------------------------------------------------------
describe('getIpPoolController', () => {
  test('should return IP pool for service', async () => {
    const result = { service: 'web', cidrBlock: '10.0.1.0/24' };
    mockGetIpPool.mockResolvedValue(result);

    req.query = { service: 'web' };
    await getIpPoolController(req, res);

    expect(mockGetIpPool).toHaveBeenCalledWith('web');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: result, message: 'OK' });
  });

  test('should throw 400 if service is missing', async () => {
    req.query = {};

    await expect(getIpPoolController(req, res)).rejects.toThrow('Service are required');
    expect(mockGetIpPool).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getAllIpPoolsController ----------------------------------------------------
// ---------------------------------------------------------------------------
describe('getAllIpPoolsController', () => {
  test('should return all IP pools', async () => {
    const result = [
      { service: 'db', cidrBlock: '10.0.0.0/24' },
      { service: 'web', cidrBlock: '10.0.1.0/24' },
    ];
    mockGetAllIpPools.mockResolvedValue(result);

    await getAllIpPoolsController(req, res);

    expect(mockGetAllIpPools).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: result, message: 'OK' });
  });
});
