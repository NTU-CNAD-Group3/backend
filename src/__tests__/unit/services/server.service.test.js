import { jest } from '@jest/globals';

await jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    connect: jest.fn(),
    query: jest.fn(),
  },
}));

await jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

await jest.unstable_mockModule('#src/services/ip.service.js', () => ({
  default: {
    assign: jest.fn(),
    release: jest.fn(),
  },
}));

const serverService = (await import('#src/services/server.service.js')).default;
const { pool } = await import('#src/models/db.js');
const logger = (await import('#src/utils/logger.js')).default;
const ipService = (await import('#src/services/ip.service.js')).default;

describe('ServerServices 全面測試', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createServer', () => {
    it('成功建立 Server', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rack exists
        .mockResolvedValueOnce({ rows: [{ service: 'svc' }] }) // rack service check
        .mockResolvedValueOnce({ rows: [] }) // position overlap
        .mockResolvedValueOnce({ rows: [{ id: 1, name: 'server1' }] }) // insert server
        .mockResolvedValueOnce() // unlock
        .mockResolvedValueOnce(); // COMMIT

      ipService.assign.mockResolvedValue(['10.0.0.1', 123]);

      const result = await serverService.createServer('server1', 'svc', 1, 1, 1, 1, 1, 2);

      expect(result).toMatchObject({ id: 1, name: 'server1' });
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Server created') }));
    });

    it('Rack 不存在應該丟錯誤', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(serverService.createServer('server1', 'svc', 1, 1, 1, 1, 1, 2)).rejects.toThrow('Rack not found');

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rack not found') }));
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('Rack Service 不符應該丟錯誤', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ service: 'other-svc' }] });

      await expect(serverService.createServer('server1', 'svc', 1, 1, 1, 1, 1, 2)).rejects.toThrow(
        'Server with the service can not insert to this rack',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('位置重疊應該丟錯誤', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ service: 'svc' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(serverService.createServer('server1', 'svc', 1, 1, 1, 1, 1, 2)).rejects.toThrow(
        'Position already occupied in this rack.',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('deleteServer', () => {
    it('成功刪除 Server', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce();
      ipService.release.mockResolvedValue('10.0.0.1');

      await serverService.deleteServer(1, 100);

      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('deleted') }));
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('刪除失敗會 rollback', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValueOnce();
      mockClient.query.mockRejectedValueOnce(new Error('fail lock'));
      ipService.release.mockRejectedValueOnce(new Error('fail release'));

      await expect(serverService.deleteServer(1, 100)).resolves.toBeUndefined();

      expect(logger.error).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('moveServer', () => {
    it('成功搬移 Server', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ service: 'svc' }] })
        .mockResolvedValueOnce({ rows: [] });
      pool.query.mockResolvedValueOnce();
      mockClient.query.mockResolvedValueOnce().mockResolvedValueOnce();

      await serverService.moveServer(100, 2, 3, 1, 'svc', 1, 2);

      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('moved') }));
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('搬移位置重疊錯誤', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ service: 'svc' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await expect(serverService.moveServer(100, 2, 3, 1, 'svc', 1, 2)).rejects.toThrow('Position already occupied in this rack.');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('Rack Service 不符錯誤', async () => {
      const mockClient = { query: jest.fn(), release: jest.fn() };
      pool.connect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()
        .mockResolvedValueOnce()
        .mockResolvedValueOnce({ rows: [{ service: 'other' }] });

      await expect(serverService.moveServer(100, 2, 3, 1, 'svc', 1, 2)).rejects.toThrow(
        'Server with the service can not insert to this rack',
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('repair', () => {
    it('成功標記 repair', async () => {
      pool.query.mockResolvedValue();
      await serverService.repair(1);
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('repaird') }));
    });

    it('repair 失敗', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await expect(serverService.repair(1)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('broken', () => {
    it('成功標記 broken', async () => {
      pool.query.mockResolvedValue();
      await serverService.broken(1);
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('broken') }));
    });

    it('broken 失敗', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await expect(serverService.broken(1)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getAllServerBroken', () => {
    it('成功取得所有 broken server', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, healthy: false }] });
      const result = await serverService.getAllServerBroken();
      expect(result).toHaveLength(1);
      expect(logger.info).toHaveBeenCalled();
    });

    it('取得 broken server 失敗', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await expect(serverService.getAllServerBroken()).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });
  describe('updateServerName', () => {
    it('成功更新 Server 名稱', async () => {
      pool.query.mockResolvedValue();
      await serverService.updateServerName(1, 'newName');
      expect(logger.info).toHaveBeenCalled();
    });
    it('更新名稱失敗', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await expect(serverService.updateServerName(1, 'newName')).rejects.toThrow('fail');
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('updateServerName error'),
        }),
      );
    });
  });

  describe('getServer', () => {
    it('成功取得單一 server', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'server1' }] });
      const result = await serverService.getServer(1);
      expect(result).toEqual([{ id: 1, name: 'server1' }]);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Get server by id=1'),
        }),
      );
    });

    it('取得 server 發生錯誤', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      const result = await serverService.getServer(1);
      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Get server by id=1 error'),
        }),
      );
    });
  });

  describe('getAllServers', () => {
    it('成功取得所有 server', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }, { id: 2 }] });
      const result = await serverService.getAllServers();
      expect(result).toHaveLength(2);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Get all servers'),
        }),
      );
    });

    it('取得所有 server 發生錯誤', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await expect(serverService.getAllServers()).rejects.toThrow('fail');
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Get all servers error'),
        }),
      );
    });
  });

  describe('getServerByType', () => {
    it('成功使用模糊搜尋', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1, name: 'example' }] });
      const result = await serverService.getServerByType('exa', 'name', 0, 10);
      expect(result).toEqual([{ id: 1, name: 'example' }]);
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('getServerByType'),
        }),
      );
    });

    it('模糊搜尋失敗', async () => {
      pool.query.mockRejectedValue(new Error('fail'));
      await expect(serverService.getServerByType('exa', 'name', 0, 10)).rejects.toThrow('fail');
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('getServerByType error'),
        }),
      );
    });
  });
});
