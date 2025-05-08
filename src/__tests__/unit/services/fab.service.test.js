import { jest } from '@jest/globals';

const mockQuery = jest.fn();
jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    query: mockQuery,
  },
  databaseClose: jest.fn().mockResolvedValue(undefined),
}));

const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();
jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: {
    info: mockLoggerInfo,
    error: mockLoggerError,
  },
}));

const fabService = (await import('#src/services/fab.service.js')).default;

const { pool } = await import('#src/models/db.js');
const logger = (await import('#src/utils/logger.js')).default;

describe('Fab Service – Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // // --- getFabDetails ---
  // describe('getFabDetails', () => {
  //   it('should execute the correct query and return the result on success', async () => {
  //     const mockName = 'FabTest';
  //     const mockDbResult = {
  //       rows: [{ fabid: 1, fabname: mockName, roomnum: 5, roomid: 10, roomname: 'RoomA' }],
  //       rowCount: 1,
  //       // Add other properties pg pool might return if needed
  //     };
  //     mockQuery.mockResolvedValue(mockDbResult); // Simulate successful DB query

  //     const result = await fabService.getFabDetails(mockName);

  //     expect(pool.query).toHaveBeenCalledTimes(1);
  //     // Verify the core parts of the query and the parameter
  //     expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT  f.id AS fabId,'), [mockName]);
  //     expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM fabs f'), [mockName]);
  //     expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE f.name = $1'), [mockName]);

  //     // The service method returns the raw result from pool.query
  //     expect(result).toEqual(mockDbResult);
  //     expect(logger.info).toHaveBeenCalledTimes(1);
  //     expect(logger.info).toHaveBeenCalledWith({ message: `msg=All fab's details get` });
  //     expect(logger.error).not.toHaveBeenCalled();
  //   });

  //   it('should log an error and return undefined if the query fails', async () => {
  //     const mockName = 'FabTest';
  //     const mockError = new Error('DB connection error');
  //     mockQuery.mockRejectedValue(mockError); // Simulate DB query error

  //     const result = await fabService.getFabDetails(mockName);

  //     expect(pool.query).toHaveBeenCalledTimes(1);
  //     expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM fabs f'), [mockName]);
  //     expect(result).toBeUndefined(); // Service catches error and likely returns undefined implicitly
  //     expect(logger.info).not.toHaveBeenCalled();
  //     expect(logger.error).toHaveBeenCalledTimes(1);
  //     // Check if the error message includes the original error
  //     expect(logger.error).toHaveBeenCalledWith({ message: expect.stringContaining(`msg=getFabDetails error error=${mockError}`) });
  //   });
  // });

  // // --- getAllRooms ---
  // describe('getAllRooms', () => {
  //   it('should fetch all rooms for a given fab ID successfully', async () => {
  //     const mockFabId = 1;
  //     const mockDbResult = {
  //       rows: [
  //         { id: 10, name: 'RoomA', fabid: mockFabId, racknum: 5, height: 10 },
  //         { id: 11, name: 'RoomB', fabid: mockFabId, racknum: 3, height: 8 },
  //       ],
  //       rowCount: 2,
  //     };
  //     mockQuery.mockResolvedValue(mockDbResult);

  //     const result = await fabService.getAllRooms(mockFabId);

  //     expect(pool.query).toHaveBeenCalledTimes(1);
  //     expect(pool.query).toHaveBeenCalledWith('SELECT * FROM Rooms WHERE fabId = $1', [mockFabId]);
  //     expect(result).toEqual(mockDbResult.rows); // Service returns rows directly
  //     expect(logger.info).toHaveBeenCalledTimes(1);
  //     expect(logger.info).toHaveBeenCalledWith({ message: `msg=AllRooms get` });
  //     expect(logger.error).not.toHaveBeenCalled();
  //   });

  //   it('should log an error and return undefined if fetching rooms fails', async () => {
  //     const mockFabId = 1;
  //     const mockError = new Error('Failed to get rooms');
  //     mockQuery.mockRejectedValue(mockError);

  //     const result = await fabService.getAllRooms(mockFabId);

  //     expect(pool.query).toHaveBeenCalledTimes(1);
  //     expect(pool.query).toHaveBeenCalledWith('SELECT * FROM Rooms WHERE fabId = $1', [mockFabId]);
  //     expect(result).toBeUndefined();
  //     expect(logger.info).not.toHaveBeenCalled();
  //     expect(logger.error).toHaveBeenCalledTimes(1);
  //     expect(logger.error).toHaveBeenCalledWith({ message: expect.stringContaining(`msg=Getall rooms error error=${mockError}`) });
  //   });
  // });

  // --- getAllFabs ---
  describe('getAllFabs', () => {
    it('should return structured data of all fabs', async () => {
      const mockDbRows = [
        {
          dc_id: 1,
          dc_name: 'FabA',
          room_id: 10,
          room_name: 'RoomA',
          rack_id: 100,
          rack_name: 'RackA',
          service: 'Storage',
          server_id: 1000,
          server_name: 'ServerA',
          unit: 1,
          frontposition: 0,
          backposition: 1,
        },
      ];

      pool.query.mockResolvedValue({ rows: mockDbRows });

      const result = await fabService.getAllFabs();

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: 'msg=All fabs get' });

      expect(result).toEqual({
        dc1: {
          name: 'FabA',
          roomNum: 1,
          rooms: {
            room10: {
              name: 'RoomA',
              rackNum: 1,
              racks: {
                rack100: {
                  name: 'RackA',
                  service: 'Storage',
                  serverNum: 1,
                  servers: {
                    server1000: {
                      name: 'ServerA',
                      unit: 1,
                      position_front: 0,
                      position_back: 1,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  // --- getFab ---
  describe('getFab', () => {
    const mockId = 1;

    it('should return structured fab data if fab exists', async () => {
      // 模擬 SELECT EXISTS 回傳 true
      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // inTable
        .mockResolvedValueOnce({
          // actual data
          rows: [
            {
              dc_id: 1,
              dc_name: 'FabX',
              room_id: 10,
              room_name: 'RoomX',
              rack_id: 100,
              rack_name: 'RackX',
              service: 'Network',
              server_id: 1000,
              server_name: 'ServerX',
            },
          ],
        });

      const result = await fabService.getFab(mockId);

      expect(pool.query).toHaveBeenCalledWith('SELECT EXISTS(SELECT 1 FROM fabs WHERE id = $1)', [mockId]);

      expect(logger.info).toHaveBeenCalledWith({ message: 'msg=Fab get' });

      expect(result).toEqual({
        id: 1,
        name: 'FabX',
        roomNum: 1,
        rooms: {
          room10: {
            id: 10,
            name: 'RoomX',
            rackNum: 1,
            racks: {
              rack100: {
                id: 100,
                name: 'RackX',
                service: 'Network',
                serverNum: 1,
                servers: {
                  server1000: {
                    id: 1000,
                    name: 'ServerX',
                  },
                },
              },
            },
          },
        },
      });
    });

    it('should throw 404 error if fab does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(fabService.getFab(mockId)).rejects.toThrow('DC not found');
      expect(logger.error).toHaveBeenCalledWith({ message: 'msg=Fab not found' });
    });
  });

  // --- createFab ---
  describe('createFab', () => {
    const mockName = 'NewFab';
    const mockRoomNum = 0;

    it('should create a fab successfully and return the new fab', async () => {
      // Mock for SELECT EXISTS
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // Name is unique

      // Mock for INSERT query
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Return new fab's ID

      const result = await fabService.createFab(mockName);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenCalledWith('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [mockName]);
      expect(pool.query).toHaveBeenCalledWith('INSERT INTO fabs (name, roomNum) VALUES ($1, $2) RETURNING id', [mockName, mockRoomNum]);

      expect(result).toEqual({ id: 1 });
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab created name=${mockName}` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if the fab name already exists', async () => {
      // Mock for SELECT EXISTS
      pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Name already exists

      await expect(fabService.createFab(mockName, mockRoomNum)).rejects.toThrow('The name must be unique');
      expect(logger.error).toHaveBeenCalledWith({ message: 'msg=The name must be unique' });
    });
  });

  // --- updateFab ---
  describe('updateFab', () => {
    const mockId = 1;
    const mockName = 'UpdatedFab';
    const mockRoomNum = 10;

    it('should update a fab successfully', async () => {
      // Mock for SELECT EXISTS
      pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Fab exists
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // Name is unique for update

      await fabService.updateFab(mockId, mockName, mockRoomNum);

      expect(pool.query).toHaveBeenCalledTimes(3);
      expect(pool.query).toHaveBeenCalledWith('SELECT EXISTS(SELECT 1 FROM fabs WHERE id = $1)', [mockId]);
      expect(pool.query).toHaveBeenCalledWith('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [mockName]);
      expect(pool.query).toHaveBeenCalledWith('UPDATE fabs SET name = $1, roomNum = $2 WHERE id = $3', [mockName, mockRoomNum, mockId]);

      expect(logger.info).toHaveBeenCalledWith({
        message: `msg=Fab updated name=${mockName} roomNum=${mockRoomNum}`,
      });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if fab does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // Fab does not exist

      await expect(fabService.updateFab(mockId, mockName, mockRoomNum)).rejects.toThrow('DC not found');
      expect(logger.error).toHaveBeenCalledWith({ message: 'msg=Fab not found' });
    });

    it('should throw an error if the updated fab name already exists', async () => {
      // Mock for SELECT EXISTS for fab
      pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Fab exists
      // Mock for SELECT EXISTS for name
      pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Name already exists

      await expect(fabService.updateFab(mockId, mockName, mockRoomNum)).rejects.toThrow('The name must be unique');
      expect(logger.error).toHaveBeenCalledWith({ message: 'msg=The name must be unique' });
    });
  });

  // --- deleteFab ---
  describe('deleteFab', () => {
    const mockName = 'FabToDelete';

    it('should delete a fab successfully', async () => {
      // Mock for SELECT EXISTS
      pool.query.mockResolvedValueOnce({ rows: [{ exists: true }] }); // Fab exists

      await fabService.deleteFab(mockName);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenCalledWith('SELECT EXISTS(SELECT 1 FROM fabs WHERE name = $1)', [mockName]);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM fabs WHERE name = $1', [mockName]);

      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab deleted name=${mockName}` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should throw an error if fab does not exist', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // Fab does not exist

      await expect(fabService.deleteFab(mockName)).rejects.toThrow('The name does not exist');
      expect(logger.error).toHaveBeenCalledWith({ message: 'msg=Fab not found' });
    });
  });
});