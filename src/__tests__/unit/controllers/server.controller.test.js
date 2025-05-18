import { jest } from '@jest/globals';

// Mock 所有 server.service 函數
const mockCreateServer = jest.fn();
const mockDeleteServer = jest.fn();
const mockMoveServer = jest.fn();
const mockGetServer = jest.fn();
const mockGetAllServers = jest.fn();
const mockRepair = jest.fn();
const mockBroken = jest.fn();
const mockGetAllServerBroken = jest.fn();
const mockUpdateServerName = jest.fn();
const mockGetServerByType = jest.fn();

await jest.unstable_mockModule('#src/services/server.service.js', () => ({
  default: {
    createServer: mockCreateServer,
    deleteServer: mockDeleteServer,
    moveServer: mockMoveServer,
    getServer: mockGetServer,
    getAllServers: mockGetAllServers,
    repair: mockRepair,
    broken: mockBroken,
    getAllServerBroken: mockGetAllServerBroken,
    updateServerName: mockUpdateServerName,
    getServerByType: mockGetServerByType,
  },
}));

// 匯入 controller
const {
  createServerController,
  deleteServerController,
  moveServerController,
  getServerController,
  getAllServersController,
  repairController,
  brokenController,
  getAllServerBrokenController,
  updateServerNameController,
  getServerByTypeController,
} = await import('#src/controllers/server.controller.js');

let req, res;
beforeEach(() => {
  req = { body: {}, query: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  jest.clearAllMocks();
});

//
// createServerController
//
describe('createServerController', () => {
  const valid = {
    name: 'srv-1',
    service: 'db',
    unit: 2,
    fabId: 1,
    roomId: 1,
    rackId: 1,
    frontPosition: 5,
    backPosition: 6,
  };

  test('should create and return 201', async () => {
    mockCreateServer.mockResolvedValue({ id: 123 });
    req.body = { ...valid };
    await createServerController(req, res);
    expect(mockCreateServer).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: { id: 123 }, message: 'Created' });
  });

  test('should fail on missing fields', async () => {
    req.body = { ...valid, name: null };
    await expect(createServerController(req, res)).rejects.toThrow(/are required/);
  });

  test('should fail on invalid unit range', async () => {
    req.body = { ...valid, frontPosition: 1, backPosition: 5, unit: 3 };
    await expect(createServerController(req, res)).rejects.toThrow(/does not match the position size/);
  });
});

//
// moveServerController
//
describe('moveServerController', () => {
  const body = {
    id: 1,
    newFabId: 2,
    newRoomId: 3,
    newRackId: 4,
    service: 'web',
    unit: 2,
    frontPosition: 10,
    backPosition: 11,
  };

  test('should move and return 200', async () => {
    req.body = { ...body };
    await moveServerController(req, res);
    expect(mockMoveServer).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success' });
  });

  test('should fail on missing fields', async () => {
    req.body = { ...body, id: null };
    await expect(moveServerController(req, res)).rejects.toThrow(/are required/);
  });

  test('should fail on unit mismatch', async () => {
    req.body = { ...body, frontPosition: 1, backPosition: 5, unit: 3 };
    await expect(moveServerController(req, res)).rejects.toThrow(/does not match the position size/);
  });
});

//
// updateServerNameController
//
describe('updateServerNameController', () => {
  test('should update and return 200', async () => {
    req.body = { id: 1, newName: 'srv-new' };
    await updateServerNameController(req, res);
    expect(mockUpdateServerName).toHaveBeenCalledWith(1, 'srv-new');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Updated' });
  });

  test('should fail if id or newName missing', async () => {
    req.body = { id: 1 };
    await expect(updateServerNameController(req, res)).rejects.toThrow(/required/);
  });
});

//
// repairController
//
describe('repairController', () => {
  test('should call repair and return 200', async () => {
    req.body = { id: 2 };
    await repairController(req, res);
    expect(mockRepair).toHaveBeenCalledWith(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Updated' });
  });

  test('should fail if id missing', async () => {
    req.body = {};
    await expect(repairController(req, res)).rejects.toThrow(/required/);
  });
});

//
// brokenController
//
describe('brokenController', () => {
  test('should call broken and return 200', async () => {
    req.body = { id: 3 };
    await brokenController(req, res);
    expect(mockBroken).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Updated' });
  });

  test('should fail if id missing', async () => {
    req.body = {};
    await expect(brokenController(req, res)).rejects.toThrow(/required/);
  });
});

//
// getAllServerBrokenController
//
describe('getAllServerBrokenController', () => {
  test('should return broken servers', async () => {
    const data = [{ id: 1 }];
    mockGetAllServerBroken.mockResolvedValue(data);
    await getAllServerBrokenController(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data, message: 'OK' });
  });
});

//
// getServerController
//
describe('getServerController', () => {
  test('should return one server', async () => {
    mockGetServer.mockResolvedValue({ id: 99 });
    req.query = { id: 99 };
    await getServerController(req, res);
    expect(mockGetServer).toHaveBeenCalledWith(99);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: { id: 99 }, message: 'OK' });
  });

  test('should fail if id missing', async () => {
    req.query = {};
    await expect(getServerController(req, res)).rejects.toThrow(/required/);
  });
});

//
// getAllServersController
//
describe('getAllServersController', () => {
  test('should return all servers', async () => {
    const servers = [{ id: 1 }, { id: 2 }];
    mockGetAllServers.mockResolvedValue(servers);
    await getAllServersController(req, res);
    expect(mockGetAllServers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: servers, message: 'OK' });
  });
});

//
// getServerByTypeController
//
describe('getServerByTypeController', () => {
  test('should return server by type', async () => {
    const result = [{ id: 1 }];
    req.query = { keyword: 'web', type: 'service', page: 1, size: 10 };
    mockGetServerByType.mockResolvedValue(result);
    await getServerByTypeController(req, res);
    expect(mockGetServerByType).toHaveBeenCalledWith('web', 'service', 1, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: result, message: 'OK' });
  });

  test('should fail if required fields missing', async () => {
    req.query = { keyword: 'x', type: null };
    await expect(getServerByTypeController(req, res)).rejects.toThrow(/required/);
  });
});

//
// deleteServerController
//
describe('deleteServerController', () => {
  test('should delete server and return 200', async () => {
    const deleted = { id: 1 };
    req.body = { rackId: 2, id: 1 };
    mockDeleteServer.mockResolvedValue(deleted);
    await deleteServerController(req, res);
    expect(mockDeleteServer).toHaveBeenCalledWith(2, 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: deleted, message: 'Deleted' });
  });

  test('should fail if rackId or id missing', async () => {
    req.body = { rackId: null, id: 1 };
    await expect(deleteServerController(req, res)).rejects.toThrow(/required/);
  });
});
