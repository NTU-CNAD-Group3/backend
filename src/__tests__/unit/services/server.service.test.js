import { jest } from '@jest/globals';

const mockQuery = jest.fn();

await jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    query: mockQuery,
  },
}));

const mockInfo = jest.fn();
const mockError = jest.fn();
await jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: {
    info: mockInfo,
    error: mockError,
  },
}));

const serverService = (await import('#src/services/server.service.js')).default;

describe('ServerServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /* ------------------------------------------------
   * createServer
   * ---------------------------------------------- */
  describe('createServer', () => {
    test('should create a server when rack position is free', async () => {
      const fakeServer = {
        id: 1,
        name: 'Server-A',
        service: 'svc-A',
        ip: '10.0.0.1',
      };

      mockQuery
        // overlap check ⇒ no rows → free position
        .mockResolvedValueOnce({ rows: [] })
        // INSERT ... RETURNING *
        .mockResolvedValueOnce({ rows: [fakeServer] });

      const result = await serverService.createServer(
        'Server-A', // name
        'svc-A', // service
        '10.0.0.1', // ip
        1, // unit (U-height)
        1, // fabId
        1, // roomId
        1, // rackId
        1, // ipPoolId
        1, // frontPosition
        2, // backPosition
      );

      expect(result).toEqual(fakeServer);
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server created') }));
    });

    test('should throw if rack position overlaps', async () => {
      // overlap query returns ≥ 1 row ⇒ occupied
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 99 }] });

      await expect(serverService.createServer('Srv', 'svc', '10.0.0.2', 1, 1, 1, 1, 1, 1, 2)).rejects.toThrow('Position already occupied');

      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server create') }));
    });
  });

  /* ------------------------------------------------
   * deleteServer
   * ---------------------------------------------- */
  describe('deleteServer', () => {
    test('should delete a server', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });

      const result = await serverService.deleteServer(42);

      expect(result.id).toBe(42);
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM servers WHERE id = $1 RETURNING *', [42]);
    });
  });

  /* ------------------------------------------------
   * updateServer
   * ---------------------------------------------- */
  describe('updateServer', () => {
    test('should update a server', async () => {
      const updated = { id: 7, name: 'Srv-New' };
      mockQuery.mockResolvedValueOnce({ rows: [updated] });

      const result = await serverService.updateServer(
        7, // id
        'Srv-New',
        'svc',
        '10.0.0.7',
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        true,
      );

      expect(result).toEqual(updated);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server 7 updated') }));
    });
  });

  /* ------------------------------------------------
   * getServer
   * ---------------------------------------------- */
  describe('getServer', () => {
    test('should return server by id', async () => {
      const server = { id: 3, name: 'Srv-3' };
      mockQuery.mockResolvedValueOnce({ rows: [server] });

      const result = await serverService.getServer(3);

      expect(result).toEqual(server);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM servers WHERE id = $1', [3]);
    });
  });

  /* ------------------------------------------------
   * getAllServers
   * ---------------------------------------------- */
  describe('getAllServers', () => {
    test('should return all servers', async () => {
      const servers = [{ id: 1 }, { id: 2 }];
      mockQuery.mockResolvedValueOnce({ rows: servers });

      const result = await serverService.getAllServers();

      expect(result).toEqual(servers);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get all servers') }));
    });
  });

  /* ------------------------------------------------
   * getServerByName
   * ---------------------------------------------- */
  describe('getServerByName', () => {
    test('should find server by name (ILIKE)', async () => {
      const server = { id: 11, name: 'My-Srv' };
      mockQuery.mockResolvedValueOnce({ rows: [server] });

      const result = await serverService.getServerByName('My-Srv');

      expect(result).toEqual(server);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM servers WHERE name ILIKE $1', ['My-Srv']);
    });
  });

  /* ------------------------------------------------
   * getServerByIp
   * ---------------------------------------------- */
  describe('getServerByIp', () => {
    test('should find server by IP', async () => {
      const server = { id: 8, ip: '10.0.0.8' };
      mockQuery.mockResolvedValueOnce({ rows: [server] });

      const result = await serverService.getServerByIp('10.0.0.8');

      expect(result).toEqual(server);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM servers WHERE ip = $1', ['10.0.0.8']);
    });
  });

  /* ------------------------------------------------
   * getAllServerByService
   * ---------------------------------------------- */
  describe('getAllServerByService', () => {
    test('should list servers by service (ILIKE)', async () => {
      const servers = [{ id: 5, service: 'db' }];
      mockQuery.mockResolvedValueOnce({ rows: servers });

      const result = await serverService.getAllServerByService('db');

      expect(result).toEqual(servers);
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM servers WHERE service ILIKE $1', ['db']);
    });
  });
});
