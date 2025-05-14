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
    unit: 1,
    fabId: 1,
    roomId: 1,
    rackId: 1,
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
      validBody.unit,
      validBody.fabId,
      validBody.roomId,
      validBody.rackId,
      validBody.frontPosition,
      validBody.backPosition,
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: created, message: 'Created' });
  });

  test('should respond 400 if required fields missing', async () => {
    req.body = { ...validBody, name: null };

    await expect(createServerController(req, res)).rejects.toThrow(
      'Name, service, unit, fabId, roomId, rackId, frontPosition, backPosition are required',
    );
    expect(mockCreateServer).not.toHaveBeenCalled();
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
    expect(res.json).toHaveBeenCalledWith({ data: deleted, message: 'Deleted' });
  });

  test('should respond 400 if id missing', async () => {
    req.body = { id: null };

    await expect(deleteServerController(req, res)).rejects.toThrow('Server ID are required');
    expect(mockDeleteServer).not.toHaveBeenCalled();
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
    expect(res.json).toHaveBeenCalledWith({ data: body, message: 'Updated' });
  });

  test('should respond 400 if required field missing', async () => {
    req.body = { ...body, name: null };

    await expect(updateServerController(req, res)).rejects.toThrow(
      'id, name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, healthy are required',
    );
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

    req.params = { id: 3 };
    await getServerController(req, res);

    expect(mockGetServer).toHaveBeenCalledWith(3);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: server, message: 'OK' });
  });

  test('should respond 400 if id missing', async () => {
    req.params = { id: null };

    await expect(getServerController(req, res)).rejects.toThrow('Server ID are required');
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
    expect(res.json).toHaveBeenCalledWith({ data: all, message: 'OK' });
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
    expect(res.json).toHaveBeenCalledWith({ data: srv, message: 'OK' });
  });

  test('should respond 400 if name missing', async () => {
    req.body = {};

    await expect(getServerByNameController(req, res)).rejects.toThrow('Server name are required');
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
    expect(res.json).toHaveBeenCalledWith({ data: srv, message: 'OK' });
  });

  test('should respond 400 if ip missing', async () => {
    req.body = {};

    await expect(getServerByIpController(req, res)).rejects.toThrow('Server IP are required');
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
    expect(res.json).toHaveBeenCalledWith({ data: list, message: 'OK' });
  });

  test('should respond 400 if service missing', async () => {
    req.body = {};

    await expect(getAllServerByServiceController(req, res)).rejects.toThrow('Server service are required');
    expect(mockGetAllServerByService).not.toHaveBeenCalled();
  });
});
