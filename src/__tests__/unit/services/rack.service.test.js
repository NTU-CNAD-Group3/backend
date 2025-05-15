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

const { pool } = await import('#src/models/db.js');
const logger = (await import('#src/utils/logger.js')).default;
const rackService = (await import('#src/services/rack.service.js')).default;

describe('RackServices', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
  });

  describe('createRacks', () => {
    it('should create racks successfully', async () => {
      const fabName = 'fab1';
      const roomId = 1;
      const rackNum = 2;
      const rackArray = [
        { name: 'rackA', service: 'svc1', height: 42 },
        { name: 'rackB', service: 'svc2', height: 40 },
      ];

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rooms exists
        .mockResolvedValueOnce({ rows: [{ racknum: 10, hasrack: 5, height: 45 }] }) // rooms constraint
        .mockResolvedValueOnce() // INSERT rack1
        .mockResolvedValueOnce() // INSERT rack2
        .mockResolvedValueOnce() // UPDATE rooms hasRack
        .mockResolvedValueOnce() // pg_advisory_unlock
        .mockResolvedValueOnce(); // COMMIT

      await expect(
        rackService.createRacks(fabName, roomId, rackNum, rackArray)
      ).resolves.not.toThrow();

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('racks created') })
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if fab not found', async () => {
      const fabName = 'unknownFab';
      const roomId = 1;
      const rackNum = 1;
      const rackArray = [{ name: 'rackA', service: 'svc1', height: 40 }];

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: false }] }); // fabs not exists

      await expect(
        rackService.createRacks(fabName, roomId, rackNum, rackArray)
      ).rejects.toMatchObject({ message: 'DC not found', status: 404 });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Fab not found') })
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if room not found', async () => {
      const fabName = 'fab1';
      const roomId = 1;
      const rackNum = 1;
      const rackArray = [{ name: 'rackA', service: 'svc1', height: 40 }];

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: false }] }); // rooms not exists

      await expect(
        rackService.createRacks(fabName, roomId, rackNum, rackArray)
      ).rejects.toMatchObject({ message: 'Room not found', status: 404 });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Room not found') })
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if rackNum exceeds room limit', async () => {
      const fabName = 'fab1';
      const roomId = 1;
      const rackNum = 6;
      const rackArray = [{ name: 'rackA', service: 'svc1', height: 40 }];

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rooms exists
        .mockResolvedValueOnce({ rows: [{ racknum: 10, hasrack: 5, height: 45 }] }); // constraint

      await expect(
        rackService.createRacks(fabName, roomId, rackNum, rackArray)
      ).rejects.toMatchObject({ message: 'Rack number out of room limitation', status: 400 });

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error if rack height exceeds room height', async () => {
      const fabName = 'fab1';
      const roomId = 1;
      const rackNum = 1;
      const rackArray = [{ name: 'rackA', service: 'svc1', height: 50 }]; // 50 > 45 room height

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // fabs id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rooms exists
        .mockResolvedValueOnce({ rows: [{ racknum: 10, hasrack: 5, height: 45 }] }); // constraint

      await expect(
        rackService.createRacks(fabName, roomId, rackNum, rackArray)
      ).rejects.toMatchObject({ message: 'Rack height out of room limitation', status: 400 });

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getRack', () => {
    it('should return rack info successfully', async () => {
      const fabName = 'fab1';
      const roomId = 1;
      const rackId = 123;

      // mock pool.query
      pool.query
        // fabs exists?
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        // get fab id
        .mockResolvedValueOnce({ rows: [{ id: 10 }] })
        // check rack exists
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        // get rack + servers join data
        .mockResolvedValueOnce({
          rows: [
            {
              rack_id: rackId,
              rack_name: 'rackName',
              service: 'svc',
              maxempty: 5,
              height: 42,
              createdat: new Date('2024-05-10T12:00:00Z'),
              updatedat: new Date('2024-05-10T12:00:00Z'),
              server_id: 1,
              server_name: 'server1',
              serverfrontposition: 1,
              serverbackposition: 2,
              serverUpdateTime: new Date('2024-05-11T12:00:00Z'),
            },
            {
              rack_id: rackId,
              rack_name: 'rackName',
              service: 'svc',
              maxempty: 5,
              height: 42,
              createdat: new Date('2024-05-10T12:00:00Z'),
              updatedat: new Date('2024-05-10T12:00:00Z'),
              server_id: null,
              server_name: null,
              serverfrontposition: null,
              serverbackposition: null,
              serverUpdateTime: null,
            },
          ],
        })
        // get maxgap
        .mockResolvedValueOnce({ rows: [{ maxgap: 3 }] })
        // update racks maxEmpty
        .mockResolvedValueOnce();

      const result = await rackService.getRack(fabName, roomId, rackId);

      expect(result.id).toBe(rackId);
      expect(result.name).toBe('rackName');
      expect(result.serverNum).toBe(1);
      expect(result.servers).toHaveProperty('server1');
      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Rack') })
      );
    });

    it('should throw if fab not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(rackService.getRack('unknown', 1, 1)).rejects.toMatchObject({
        message: 'DC not found',
        status: 404,
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Fab not found') })
      );
    });

    it('should throw if rack not found', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(rackService.getRack('fab', 1, 999)).rejects.toMatchObject({
        message: 'Rack not found',
        status: 404,
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Rack not found') })
      );
    });
  });

  describe('updateRack', () => {
    it('should update rack successfully', async () => {
      const rackId = 1;
      const name = 'newName';

      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // exists check
        .mockResolvedValueOnce(); // update query

      await expect(rackService.updateRack(rackId, name)).resolves.not.toThrow();

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('updated') })
      );
    });

    it('should throw if rack not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(rackService.updateRack(999, 'name')).rejects.toMatchObject({
        message: 'Rack not found',
        status: 404,
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Rack not found') })
      );
    });
  });

  describe('deleteRack', () => {
    it('should delete rack successfully', async () => {
      const roomId = 1;
      const rackId = 100;

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rack exists
        .mockResolvedValueOnce({ rows: [{ exists: false }] }) // rack empty (no servers)
        .mockResolvedValueOnce() // DELETE rack
        .mockResolvedValueOnce() // UPDATE rooms
        .mockResolvedValueOnce() // pg_advisory_unlock
        .mockResolvedValueOnce(); // COMMIT

      await expect(rackService.deleteRack(roomId, rackId)).resolves.not.toThrow();

      expect(logger.info).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('deleted') })
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw if rack not found', async () => {
      const roomId = 1;
      const rackId = 100;

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: false }] }); // rack not found

      await expect(rackService.deleteRack(roomId, rackId)).rejects.toMatchObject({
        message: 'Rack not found',
        status: 404,
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Rack not found') })
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw if rack is not empty', async () => {
      const roomId = 1;
      const rackId = 100;

      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // pg_advisory_lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // rack exists
        .mockResolvedValueOnce({ rows: [{ exists: true }] }); // rack not empty

      await expect(rackService.deleteRack(roomId, rackId)).rejects.toMatchObject({
        message: 'Rack is not Empty',
        status: 400,
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Rack is not Empty') })
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});