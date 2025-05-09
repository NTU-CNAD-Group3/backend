import { jest } from '@jest/globals';

// Mock dependencies
const mockQuery = jest.fn();
const mockConnect = jest.fn();
jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    query: mockQuery,
    connect: mockConnect,
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

// Import the service after mocks
const roomService = (await import('#src/services/room.service.js')).default;

describe('RoomServices', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRooms', () => {
    test('throws 404 if fab not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(roomService.createRooms('fab1', 2, []))
        .rejects.toThrow('DC not found');

      expect(mockLoggerError).toHaveBeenCalledWith({
        message: expect.stringContaining('Fab not found'),
      });
    });

    test('creates rooms successfully', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) 
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });     

      mockConnect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValue();

      const roomArray = [{ name: 'Room A', rackNum: 2, height: 42 }];
      await roomService.createRooms('fab1', 1, roomArray);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO rooms'),
        ['Room A', 0, 1, 2, 42]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE fabs'),
        [1, 'fab1']
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

      expect(mockLoggerInfo).toHaveBeenCalledWith({
        message: expect.stringContaining('1 rooms created'),
      });
    });

    test('rolls back on error', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) 
        .mockResolvedValueOnce({ rows: [{ id: 1 }] });      

      mockConnect.mockResolvedValue(mockClient);
      mockClient.query
        .mockResolvedValueOnce()  
        .mockRejectedValue(new Error('Insert error')); 

      await expect(roomService.createRooms('fab1', 1, [{ name: 'Room A', rackNum: 2, height: 42 }]))
        .rejects.toThrow('Insert error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    //   expect(mockLoggerError).toHaveBeenCalledWith({
    //     message: expect.stringContaining('1 rooms create error'),
    //   });
    });
  });

  describe('getRoom', () => {
    test('throws 404 if fab not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(roomService.getRoom('fab1', 1))
        .rejects.toThrow('DC not found');

      expect(mockLoggerError).toHaveBeenCalledWith({
        message: expect.stringContaining('Fab not found'),
      });
    });

    test('throws 404 if room not found', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] })  
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })         
        .mockResolvedValueOnce({ rows: [{ exists: false }] }); 

      await expect(roomService.getRoom('fab1', 1))
        .rejects.toThrow('Room not found');

      expect(mockLoggerError).toHaveBeenCalledWith({
        message: expect.stringContaining('Room not found'),
      });
    });

    test('returns room data', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] })  
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })         
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) 
        .mockResolvedValueOnce({
          rows: [
            {
              room_id: 1,
              room_name: 'Room A',
              roomnum: 5,
              hasrack: true,
              createdat: '2024-01-01',
              updatedat: '2024-01-02',
              rack_id: 10,
              rack_name: 'Rack X',
              service: 'Service X',
              server_id: 100,
              server_name: 'Server Alpha',
            },
          ],
        }); // final data

      const result = await roomService.getRoom('fab1', 1);

      expect(result.name).toBe('Room A');
      expect(result.racks.rack10).toBeDefined();
      expect(result.racks.rack10.servers.server100).toEqual({ name: 'Server Alpha' });

      expect(mockLoggerInfo).toHaveBeenCalledWith({
        message: expect.stringContaining('Room 1 get'),
      });
    });
  });

  describe('updateRoom', () => {
    test('throws 404 if room not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(roomService.updateRoom(1, 'Room X', 7))
        .rejects.toThrow('Room not found');

      expect(mockLoggerError).toHaveBeenCalledWith({
        message: expect.stringContaining('Room not found'),
      });
    });

    test('updates room successfully', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ exists: true }] })
        .mockResolvedValueOnce(); // update query

      await roomService.updateRoom(1, 'Room X', 7);

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE rooms SET rackNum = $1, name = $2 WHERE id = $3',
        [7, 'Room X', 1]
      );

      expect(mockLoggerInfo).toHaveBeenCalledWith({
        message: expect.stringContaining('Room 1 updated'),
      });
    });
  });

  describe('deleteRoom', () => {
    test('throws 404 if room not found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ exists: false }] });

      await expect(roomService.deleteRoom('fab1', 1))
        .rejects.toThrow('Room not found');

      expect(mockLoggerError).toHaveBeenCalledWith({
        message: expect.stringContaining('Room not found'),
      });
    });

    test('deletes room successfully', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [{ exists: true }] });
      mockConnect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValue();

      await roomService.deleteRoom('fab1', 1);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(
        'DELETE FROM rooms WHERE id = $1',
        [1]
      );
      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE fabs'),
        ['fab1']
      );
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

      expect(mockLoggerInfo).toHaveBeenCalledWith({
        message: expect.stringContaining('Room 1 deleted'),
      });
    });

    test('rolls back on error', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      mockQuery.mockResolvedValueOnce({ rows: [{ exists: true }] }); 
      mockConnect.mockResolvedValue(mockClient);

      mockClient.query
        .mockResolvedValueOnce()  
        .mockRejectedValue(new Error('Delete error')); 

      await expect(roomService.deleteRoom('fab1', 1))
        .rejects.toThrow('Delete error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    //   expect(mockLoggerError).toHaveBeenCalledWith({
    //     message: expect.stringContaining('Room 1 deleted error'),
    //   });
    });
    
  });
});