import { jest } from '@jest/globals';

const mockCreateServer = jest.fn();
const mockDeleteServer = jest.fn();
const mockUpdateServer = jest.fn();
const mockGetServer = jest.fn();
const mockGetAllServers = jest.fn();
const mockGetServerByName = jest.fn();
const mockGetServerByIp = jest.fn();
const mockGetAllServerByService = jest.fn();

await jest.unstable_mockModule('#src/services/server.service.js', () => ({
  default: {
    createServer: mockCreateServer,
    deleteServer: mockDeleteServer,
    updateServer: mockUpdateServer,
    getServer: mockGetServer,
    getAllServers: mockGetAllServers,
    getServerByName: mockGetServerByName,
    getServerByIp: mockGetServerByIp,
    getAllServerByService: mockGetAllServerByService,
  },
}));

const {
  createServerController,
  deleteServerController,
  updateServerController,
  getServerController,
  getAllServersController,
  getServerByNameController,
  getServerByIpController,
  getAllServerByServiceController,
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

// ---------------------------------------------------------------------------
// createServerController -----------------------------------------------------
// ---------------------------------------------------------------------------
describe('createServerController', () => {
  const validBody = {
    name: 'srv‑A',
    service: 'db',
    ip: '10.0.0.1',
    unit: 1,
    fabId: 1,
    roomId: 1,
    rackId: 1,
    ipPoolId: 1,
    frontPosition: 1,
    backPosition: 2,
  };

  test('should create server and return 201', async () => {
    const created = { ...validBody, id: 55 };
    mockCreateServer.mockResolvedValue(created);

    req.body = { ...validBody };
    await createServerController(req, res);

    expect(mockCreateServer).toHaveBeenCalledWith(
      validBody.name,
      validBody.service,
      validBody.ip,
      validBody.unit,
      validBody.fabId,
      validBody.roomId,
      validBody.rackId,
      validBody.ipPoolId,
      validBody.frontPosition,
      validBody.backPosition,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  test('should respond 400 if required fields missing', async () => {
    req.body = { ...validBody, name: null };
    await createServerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('name, service') }));
    expect(mockCreateServer).not.toHaveBeenCalled();
  });

  test('should respond 500 if service throws', async () => {
    req.body = { ...validBody };
    mockCreateServer.mockRejectedValue(new Error('DB fail'));

    await createServerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Can not assign IP' });
  });
});

// ---------------------------------------------------------------------------
// deleteServerController -----------------------------------------------------
// ---------------------------------------------------------------------------
describe('deleteServerController', () => {
  test('should delete server and return 201', async () => {
    const deleted = { id: 9 };
    mockDeleteServer.mockResolvedValue(deleted);

    req.body = { id: 9 };
    await deleteServerController(req, res);

    expect(mockDeleteServer).toHaveBeenCalledWith(9);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });

  test('should respond 400 if id missing', async () => {
    req.body = { id: null };
    await deleteServerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server ID are required' });
    expect(mockDeleteServer).not.toHaveBeenCalled();
  });

  test('should respond 500 on service error', async () => {
    req.body = { id: 1 };
    mockDeleteServer.mockRejectedValue(new Error('fail'));

    await deleteServerController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Can not delete server' });
  });
});

// ---------------------------------------------------------------------------
// updateServerController -----------------------------------------------------
// ---------------------------------------------------------------------------
describe('updateServerController', () => {
  const body = {
    id: 1,
    name: 'srv‑B',
    service: 'web',
    ip: '10.0.0.2',
    unit: 1,
    fabId: 1,
    roomId: 1,
    rackId: 1,
    ipPoolId: 1,
    frontPosition: 2,
    backPosition: 3,
    healthy: true,
  };

  test('should update server and return 201', async () => {
    mockUpdateServer.mockResolvedValue({ ...body });

    req.body = { ...body };
    await updateServerController(req, res);

    expect(mockUpdateServer).toHaveBeenCalledWith(
      body.id,
      body.name,
      body.service,
      body.ip,
      body.unit,
      body.fabId,
      body.roomId,
      body.rackId,
      body.ipPoolId,
      body.frontPosition,
      body.backPosition,
      body.healthy,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(body);
  });

  test('should respond 400 if required field missing', async () => {
    req.body = { ...body, name: null };
    await updateServerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockUpdateServer).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getServerController --------------------------------------------------------
// ---------------------------------------------------------------------------
describe('getServerController', () => {
  test('should get server by id', async () => {
    const server = { id: 3 };
    mockGetServer.mockResolvedValue(server);

    req.body = { id: 3 };
    await getServerController(req, res);

    expect(mockGetServer).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(server);
  });

  test('should respond 400 if id missing', async () => {
    req.body = { id: null };
    await getServerController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockGetServer).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getAllServersController ----------------------------------------------------
// ---------------------------------------------------------------------------
describe('getAllServersController', () => {
  test('should return all servers', async () => {
    const all = [{ id: 1 }, { id: 2 }];
    mockGetAllServers.mockResolvedValue(all);

    await getAllServersController(req, res);

    expect(mockGetAllServers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(all);
  });

  test('should respond 500 on service error', async () => {
    mockGetAllServers.mockRejectedValue(new Error('fail'));

    await getAllServersController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Can not get all servers' });
  });
});

// ---------------------------------------------------------------------------
// getServerByNameController --------------------------------------------------
// ---------------------------------------------------------------------------
describe('getServerByNameController', () => {
  test('should get server by name', async () => {
    const srv = { id: 4 };
    mockGetServerByName.mockResolvedValue(srv);

    req.body = { name: 'srv‑C' };
    await getServerByNameController(req, res);

    expect(mockGetServerByName).toHaveBeenCalledWith('srv‑C');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(srv);
  });

  test('should respond 400 if name missing', async () => {
    req.body = {};
    await getServerByNameController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockGetServerByName).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getServerByIpController ----------------------------------------------------
// ---------------------------------------------------------------------------
describe('getServerByIpController', () => {
  test('should get server by ip', async () => {
    const srv = { id: 5 };
    mockGetServerByIp.mockResolvedValue(srv);

    req.body = { ip: '10.0.0.5' };
    await getServerByIpController(req, res);

    expect(mockGetServerByIp).toHaveBeenCalledWith('10.0.0.5');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(srv);
  });

  test('should respond 400 if ip missing', async () => {
    req.body = {};
    await getServerByIpController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockGetServerByIp).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getAllServerByServiceController -------------------------------------------
// ---------------------------------------------------------------------------
describe('getAllServerByServiceController', () => {
  test('should list servers by service', async () => {
    const list = [{ id: 6 }];
    mockGetAllServerByService.mockResolvedValue(list);

    req.body = { service: 'db' };
    await getAllServerByServiceController(req, res);

    expect(mockGetAllServerByService).toHaveBeenCalledWith('db');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(list);
  });

  test('should respond 400 if service missing', async () => {
    req.body = {};
    await getAllServerByServiceController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockGetAllServerByService).not.toHaveBeenCalled();
  });
});
