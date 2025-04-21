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

  // --- getFabDetails ---
  describe('getFabDetails', () => {
    it('should execute the correct query and return the result on success', async () => {
      const mockName = 'FabTest';
      const mockDbResult = {
        rows: [{ fabid: 1, fabname: mockName, roomnum: 5, roomid: 10, roomname: 'RoomA' }],
        rowCount: 1,
        // Add other properties pg pool might return if needed
      };
      mockQuery.mockResolvedValue(mockDbResult); // Simulate successful DB query

      const result = await fabService.getFabDetails(mockName);

      expect(pool.query).toHaveBeenCalledTimes(1);
      // Verify the core parts of the query and the parameter
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT  f.id AS fabId,'), [mockName]);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM fabs f'), [mockName]);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE f.name = $1'), [mockName]);

      // The service method returns the raw result from pool.query
      expect(result).toEqual(mockDbResult);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=All fab's details get` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if the query fails', async () => {
      const mockName = 'FabTest';
      const mockError = new Error('DB connection error');
      mockQuery.mockRejectedValue(mockError); // Simulate DB query error

      const result = await fabService.getFabDetails(mockName);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM fabs f'), [mockName]);
      expect(result).toBeUndefined(); // Service catches error and likely returns undefined implicitly
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      // Check if the error message includes the original error
      expect(logger.error).toHaveBeenCalledWith({ message: expect.stringContaining(`msg=getFabDetails error error=${mockError}`) });
    });
  });

  // --- getAllRooms ---
  describe('getAllRooms', () => {
    it('should fetch all rooms for a given fab ID successfully', async () => {
      const mockFabId = 1;
      const mockDbResult = {
        rows: [
          { id: 10, name: 'RoomA', fabid: mockFabId, racknum: 5, height: 10 },
          { id: 11, name: 'RoomB', fabid: mockFabId, racknum: 3, height: 8 },
        ],
        rowCount: 2,
      };
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.getAllRooms(mockFabId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM Rooms WHERE fabId = $1', [mockFabId]);
      expect(result).toEqual(mockDbResult.rows); // Service returns rows directly
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=AllRooms get` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if fetching rooms fails', async () => {
      const mockFabId = 1;
      const mockError = new Error('Failed to get rooms');
      mockQuery.mockRejectedValue(mockError);

      const result = await fabService.getAllRooms(mockFabId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM Rooms WHERE fabId = $1', [mockFabId]);
      expect(result).toBeUndefined();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({ message: expect.stringContaining(`msg=Getall rooms error error=${mockError}`) });
    });
  });

  // --- getAllFabs ---
  describe('getAllFabs', () => {
    it('should fetch all fabs successfully', async () => {
      const mockDbResult = {
        rows: [
          { id: 1, name: 'FabA', roomnum: 2 },
          { id: 2, name: 'FabB', roomnum: 3 },
        ],
        rowCount: 2,
      };
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.getAllFabs();

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM fabs');
      expect(result).toEqual(mockDbResult.rows);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=AllFabs get` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if fetching all fabs fails', async () => {
      const mockError = new Error('DB connection lost');
      mockQuery.mockRejectedValue(mockError);

      const result = await fabService.getAllFabs();

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM fabs');
      expect(result).toBeUndefined();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({ message: expect.stringContaining(`msg=Getall fabs error error=${mockError}`) });
    });
  });

  // --- getFab ---
  describe('getFab', () => {
    it('should fetch a single fab by ID successfully', async () => {
      const mockFabId = 1;
      const mockDbResult = {
        rows: [{ id: mockFabId, name: 'FabA', roomnum: 2 }],
        rowCount: 1,
      };
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.getFab(mockFabId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM fabs WHERE id = $1', [mockFabId]);
      expect(result).toEqual(mockDbResult.rows[0]); // Service returns the first row
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab get` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should return undefined if fab with given ID is not found', async () => {
      const mockFabId = 99;
      const mockDbResult = { rows: [], rowCount: 0 }; // Simulate not found
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.getFab(mockFabId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM fabs WHERE id = $1', [mockFabId]);
      expect(result).toBeUndefined(); // Accessing rows[0] on empty array is undefined
      expect(logger.info).toHaveBeenCalledTimes(1); // Should still log success of query execution
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab get` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if fetching a fab fails', async () => {
      const mockFabId = 1;
      const mockError = new Error('Query failed');
      mockQuery.mockRejectedValue(mockError);

      const result = await fabService.getFab(mockFabId);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM fabs WHERE id = $1', [mockFabId]);
      expect(result).toBeUndefined();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({ message: expect.stringContaining(`msg=Fab get error error=${mockError}`) });
    });
  });

  // --- createFab ---
  describe('createFab', () => {
    it('should create a fab successfully and return the new fab', async () => {
      const mockName = 'NewFab';
      const mockRoomNum = 5;
      const mockDbResult = {
        rows: [{ id: 3, name: mockName, roomnum: mockRoomNum }], // RETURNING * gives back the row
        rowCount: 1,
      };
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.createFab(mockName, mockRoomNum);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('INSERT INTO fabs (name, roomNum) VALUES ($1, $2) RETURNING *', [mockName, mockRoomNum]);
      expect(result).toEqual(mockDbResult.rows[0]);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab created name=${mockName}` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if creating a fab fails', async () => {
      const mockName = 'NewFab';
      const mockRoomNum = 5;
      const mockError = new Error('Unique constraint violation');
      mockQuery.mockRejectedValue(mockError);

      const result = await fabService.createFab(mockName, mockRoomNum);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('INSERT INTO fabs (name, roomNum) VALUES ($1, $2) RETURNING *', [mockName, mockRoomNum]);
      expect(result).toBeUndefined();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=Fab create name=${mockName} error error=${mockError}`),
      });
    });
  });

  // --- updateFab ---
  describe('updateFab', () => {
    it('should update a fab successfully and return the updated fab', async () => {
      const mockId = 1;
      const mockName = 'UpdatedFab';
      const mockRoomNum = 10;
      const mockDbResult = {
        rows: [{ id: mockId, name: mockName, roomnum: mockRoomNum }], // RETURNING *
        rowCount: 1,
      };
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.updateFab(mockId, mockName, mockRoomNum);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('UPDATE fabs SET name = $1, roomNum = $2 WHERE id = $3 RETURNING *', [
        mockName,
        mockRoomNum,
        mockId,
      ]);
      expect(result).toEqual(mockDbResult.rows[0]);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab updated name=${mockName} roomNum=${mockRoomNum}` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if updating a fab fails', async () => {
      const mockId = 1;
      const mockName = 'UpdatedFab';
      const mockRoomNum = 10;
      const mockError = new Error('Update conflict');
      mockQuery.mockRejectedValue(mockError);

      const result = await fabService.updateFab(mockId, mockName, mockRoomNum);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('UPDATE fabs SET name = $1, roomNum = $2 WHERE id = $3 RETURNING *', [
        mockName,
        mockRoomNum,
        mockId,
      ]);
      expect(result).toBeUndefined();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=Fab update id=${mockId} error error=${mockError}`),
      });
    });
  });

  // --- deleteFab ---
  describe('deleteFab', () => {
    it('should delete a fab successfully and return the deleted fab', async () => {
      const mockName = 'ToDeleteFab';
      const mockDbResult = {
        rows: [{ id: 4, name: mockName, roomnum: 3 }], // RETURNING *
        rowCount: 1,
      };
      mockQuery.mockResolvedValue(mockDbResult);

      const result = await fabService.deleteFab(mockName);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM fabs WHERE name = $1 RETURNING *', [mockName]);
      expect(result).toEqual(mockDbResult.rows[0]);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith({ message: `msg=Fab deleted name=${mockName}` });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should log an error and return undefined if deleting a fab fails', async () => {
      const mockName = 'ToDeleteFab';
      const mockError = new Error('Foreign key constraint');
      mockQuery.mockRejectedValue(mockError);

      const result = await fabService.deleteFab(mockName);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query).toHaveBeenCalledWith('DELETE FROM fabs WHERE name = $1 RETURNING *', [mockName]);
      expect(result).toBeUndefined();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith({
        message: expect.stringContaining(`msg=Fab delete name=${mockName} error error=${mockError}`),
      });
    });
  });
});
