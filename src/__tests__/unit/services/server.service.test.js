import { jest } from '@jest/globals';

const mockQuery = jest.fn();
await jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: { query: mockQuery },
}));

const mockInfo = jest.fn();
const mockError = jest.fn();
await jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: { info: mockInfo, error: mockError },
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
    const params = ['Server-A', 'svc-A', '10.0.0.1', 1, 1, 1, 1, 1, 1, 2];

    test('creates server when rack slot free', async () => {
      const fake = { id: 1, name: 'Server-A' };
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // overlap
        .mockResolvedValueOnce({ rows: [fake] }); // insert

      const result = await serverService.createServer(...params);
      expect(result).toEqual(fake);
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server created') }));
    });

    test('throws when rack slot overlaps', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 99 }] });
      await expect(serverService.createServer(...params)).rejects.toThrow('Position already occupied');
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server create') }));
    });
  });

  /* ------------------------------------------------
   * deleteServer
   * ---------------------------------------------- */
  describe('deleteServer', () => {
    test('deletes server and returns row', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 42 }] });
      const res = await serverService.deleteServer(42);
      expect(res.id).toBe(42);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server 42 deleted') }));
    });

    test('logs error and returns undefined on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('db err'));
      const res = await serverService.deleteServer(1);
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server 1 deleted error') }));
    });
  });

  /* ------------------------------------------------
   * updateServer
   * ---------------------------------------------- */
  describe('updateServer', () => {
    const args = [7, 'Srv-New', 'svc', '10.0.0.7', 1, 1, 1, 1, 1, 1, 2, true];

    test('updates server', async () => {
      const row = { id: 7 };
      mockQuery.mockResolvedValueOnce({ rows: [row] });
      const res = await serverService.updateServer(...args);
      expect(res).toEqual(row);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server 7 updated') }));
    });

    test('logs error and returns undefined on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('fail'));
      const res = await serverService.updateServer(...args);
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server 7 updated error') }));
    });
  });

  /* ------------------------------------------------
   * getServer
   * ---------------------------------------------- */
  describe('getServer', () => {
    test('returns server by id', async () => {
      const row = { id: 3 };
      mockQuery.mockResolvedValueOnce({ rows: [row] });
      const res = await serverService.getServer(3);
      expect(res).toEqual(row);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get server by id=3') }));
    });

    test('logs error and returns undefined on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('fail'));
      const res = await serverService.getServer(1);
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get server by id=1 error') }));
    });
  });

  /* ------------------------------------------------
   * getAllServers
   * ---------------------------------------------- */
  describe('getAllServers', () => {
    test('lists all servers', async () => {
      const list = [{ id: 1 }];
      mockQuery.mockResolvedValueOnce({ rows: list });
      const res = await serverService.getAllServers();
      expect(res).toEqual(list);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get all servers') }));
    });

    test('logs error and returns undefined on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('err'));
      const res = await serverService.getAllServers();
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get all servers error') }));
    });
  });

  /* ------------------------------------------------
   * getServerByName
   * ---------------------------------------------- */
  describe('getServerByName', () => {
    test('finds by name', async () => {
      const srv = { id: 11 };
      mockQuery.mockResolvedValueOnce({ rows: [srv] });
      const res = await serverService.getServerByName('abc');
      expect(res).toEqual(srv);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get server by name=abc') }));
    });

    test('logs error on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('fail'));
      const res = await serverService.getServerByName('abc');
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get server by name=abc error') }));
    });
  });

  /* ------------------------------------------------
   * getServerByIp
   * ---------------------------------------------- */
  describe('getServerByIp', () => {
    test('finds by ip', async () => {
      const srv = { id: 8 };
      mockQuery.mockResolvedValueOnce({ rows: [srv] });
      const res = await serverService.getServerByIp('10.0.0.8');
      expect(res).toEqual(srv);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get server by ip=10.0.0.8') }));
    });

    test('logs error on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('fail'));
      const res = await serverService.getServerByIp('10');
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get server by ip=10 error') }));
    });
  });

  /* ------------------------------------------------
   * getAllServerByService
   * ---------------------------------------------- */
  describe('getAllServerByService', () => {
    test('lists by service', async () => {
      const list = [{ id: 5 }];
      mockQuery.mockResolvedValueOnce({ rows: list });
      const res = await serverService.getAllServerByService('db');
      expect(res).toEqual(list);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Get all servers by service=db') }));
    });

    test('logs error on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('fail'));
      const res = await serverService.getAllServerByService('web');
      expect(res).toBeUndefined();
      expect(mockError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Get all servers by service=web error') }),
      );
    });
  });
});
