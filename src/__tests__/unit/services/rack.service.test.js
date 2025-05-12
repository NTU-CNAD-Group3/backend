import { jest } from '@jest/globals';

const mockQuery = jest.fn();
const mockConnect = jest.fn();
const mockRelease = jest.fn();
const mockClient = {
  query: mockQuery,
  release: mockRelease,
};

await jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    query: mockQuery,
    connect: mockConnect.mockResolvedValue(mockClient),
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

const rackService = (await import('#src/services/rack.service.js')).default;

describe('RackServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRacks', () => {
    test('should create racks successfully', async () => {
      mockQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // advisory lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // room exists
        .mockResolvedValueOnce({ rows: [{ racknum: 10, hasrack: 2 }] }) // room constraint
        .mockResolvedValue({}) // insert & update (multiple)
        .mockResolvedValue({}); // advisory unlock

      const racks = [
        { name: 'Rack 1', service: 'S1', height: 42 },
        { name: 'Rack 2', service: 'S2', height: 42 },
      ];

      await rackService.createRacks('Fab1', 100, 2, racks);

      expect(mockQuery).toHaveBeenCalled();
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('2 racks created') }));
    });

    test('should throw error if fab not found', async () => {
      mockQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // advisory lock
        .mockResolvedValueOnce({ rows: [{ exists: false }] }); // fabs not found

      await expect(rackService.createRacks('InvalidFab', 100, 1, [])).rejects.toThrow('DC not found');

      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Fab not found') }));
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
    test('should throw error if rack number exceeds room limit', async () => {
      mockQuery
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // advisory lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // room exists
        .mockResolvedValueOnce({ rows: [{ racknum: 5, hasrack: 4 }] }); // room constraint 超額

      await expect(rackService.createRacks('Fab1', 100, 2, [{ name: 'Rack X', service: 'S', height: 42 }])).rejects.toThrow(
        'Rack number out of room limitation',
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getRack', () => {
    test('should return rack info with servers and recomputed maxEmpty', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rack exists
        .mockResolvedValueOnce({
          rows: [
            {
              rack_id: 1,
              rack_name: 'Rack A',
              maxempty: 999, // will be overwritten by recompute
              height: 42,
              service: 'Service A',
              createdat: new Date(),
              updatedat: new Date(),
              server_id: 10,
              server_name: 'Server X',
              serverfrontposition: 5,
              serverbackposition: 10,
            },
          ],
        });

      const result = await rackService.getRack('Fab1', 100, 1);

      expect(result.name).toBe('Rack A');
      expect(result.servers.server10).toEqual({ id: 10, name: 'Server X' });
      // 新 maxEmpty = max( (5-1), 42-10) = 32
      expect(result.maxEmpty).toBe(32);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rack 1 get') }));
    });

    test('should throw error if fab not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] }); // fabs not found

      await expect(rackService.getRack('InvalidFab', 100, 1)).rejects.toThrow('DC not found');

      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Fab not found') }));
    });

    test('should return rack info with no servers and maxEmpty = height', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rack exists
        .mockResolvedValueOnce({
          rows: [
            {
              rack_id: 1,
              rack_name: 'Rack A',
              maxempty: 0, // will be overwritten by recompute
              height: 42,
              service: 'Service A',
              createdat: new Date(),
              updatedat: new Date(),
              server_id: null, // no server
              serverfrontposition: null,
              serverbackposition: null,
            },
          ],
        });

      const result = await rackService.getRack('Fab1', 100, 1);

      expect(result.name).toBe('Rack A');
      expect(result.servers).toEqual({});
      expect(result.serverNum).toBe(0);
      expect(result.maxEmpty).toBe(42); // 無伺服器 → 最大空間 = 機櫃高度
    });
  });

  describe('updateRack', () => {
    test('should update rack name successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: true }] }); // rack exists
      mockQuery.mockResolvedValueOnce({}); // update query

      await rackService.updateRack(1, 'New Rack Name');

      expect(mockQuery).toHaveBeenCalledWith('UPDATE racks SET name = $1 WHERE id = $2', ['New Rack Name', 1]);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rack 1 updated') }));
    });

    test('should throw error if rack not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] }); // rack not found

      await expect(rackService.updateRack(999, 'Name')).rejects.toThrow('Rack not found');

      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rack not found') }));
    });
  });

  describe('deleteRack', () => {
    test('should delete rack successfully', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rack exists
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({}) // DELETE rack
        .mockResolvedValueOnce({}) // UPDATE rooms
        .mockResolvedValueOnce({}); // COMMIT

      await rackService.deleteRack(100, 1);

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM racks WHERE id = $1', [1]);
      expect(mockInfo).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rack 100 deleted') }));
    });

    test('should throw error if rack not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] }); // rack not found

      await expect(rackService.deleteRack(100, 1)).rejects.toThrow('Rack not found');

      expect(mockError).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Rack not found') }));
    });
  });
});
