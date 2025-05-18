import { jest } from '@jest/globals';

await jest.unstable_mockModule('#src/models/db.js', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));

await jest.unstable_mockModule('#src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const { default: roomService } = await import('#src/services/room.service.js');
const { pool } = await import('#src/models/db.js');
const logger = (await import('#src/utils/logger.js')).default;

describe('RoomServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRooms', () => {
    test('should create rooms successfully', async () => {
      const mockClient = {
        query: jest
          .fn()
          .mockResolvedValueOnce() // BEGIN
          .mockResolvedValueOnce() // advisory lock
          .mockResolvedValue() // insert rooms
          .mockResolvedValue() // update fabs
          .mockResolvedValueOnce() // unlock
          .mockResolvedValueOnce(), // COMMIT
        release: jest.fn(),
      };

      // 檢查 fabs 存在
      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // check fabs exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // get fab id

      pool.connect.mockResolvedValue(mockClient);

      const rooms = [
        { name: 'Room 1', rackNum: 10, height: 42 },
        { name: 'Room 2', rackNum: 5, height: 30 },
      ];

      await expect(roomService.createRooms('Fab1', 2, rooms)).resolves.toBeUndefined();

      expect(pool.query).toHaveBeenCalledTimes(2); // check fab and get id
      expect(pool.connect).toHaveBeenCalledTimes(1);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('SELECT pg_advisory_lock($1)', [expect.any(Number)]);
      expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO rooms(name, hasRack, fabId, rackNum, height) VALUES($1, $2, $3, $4, $5)', [
        'Room 1',
        0,
        123,
        10,
        42,
      ]);
      expect(mockClient.query).toHaveBeenCalledWith('INSERT INTO rooms(name, hasRack, fabId, rackNum, height) VALUES($1, $2, $3, $4, $5)', [
        'Room 2',
        0,
        123,
        5,
        30,
      ]);
      expect(mockClient.query).toHaveBeenCalledWith('UPDATE fabs SET roomNum = roomNum + $1,updatedAt = NOW() WHERE name=$2;', [2, 'Fab1']);
      expect(mockClient.query).toHaveBeenCalledWith('SELECT pg_advisory_unlock($1)', [expect.any(Number)]);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=2 rooms created' }));
    });

    test('should throw error when fab not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // fab not exists

      await expect(roomService.createRooms('InvalidFab', 1, [])).rejects.toThrow('DC not found');

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Fab not found' }));
    });

    test('should rollback and throw error if insert rooms fail', async () => {
      const mockClient = {
        query: jest
          .fn()
          .mockResolvedValueOnce() // BEGIN
          .mockResolvedValueOnce() // advisory lock
          .mockRejectedValueOnce(new Error('Insert failed')), // insert rooms fail
        release: jest.fn(),
      };

      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fab exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // fab id

      pool.connect.mockResolvedValue(mockClient);

      const rooms = [{ name: 'Room 1', rackNum: 10, height: 42 }];

      await expect(roomService.createRooms('Fab1', 1, rooms)).rejects.toThrow('Insert failed');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=1 rooms create error' }));
    });
  });

  describe('getRoom', () => {
    test('should return room data successfully', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fab exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // fab id
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // room exists
        .mockResolvedValueOnce({
          rows: [
            {
              room_id: 1,
              room_name: 'Room 1',
              racknum: 10,
              hasrack: 2,
              createdat: new Date(),
              updatedat: new Date(),
              rack_id: 100,
              rack_name: 'Rack 1',
              service: 'Service 1',
              server_id: 200,
              server_name: 'Server 1',
            },
          ],
        }); // room data

      const result = await roomService.getRoom('Fab1', 1);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Room 1');
      expect(result.rackNum).toBe(10);
      expect(result.hasRack).toBe(2);
      expect(result.racks.rack100.servers.server200.name).toBe('Server 1');
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room 1 get' }));
    });

    test('should throw error when fab not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // fab not found

      await expect(roomService.getRoom('InvalidFab', 1)).rejects.toThrow('DC not found');

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Fab not found' }));
    });

    test('should throw error when room not found', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fab exists
        .mockResolvedValueOnce({ rows: [{ id: 123 }] }) // fab id
        .mockResolvedValueOnce({ rows: [{ exists: false }] }); // room not found

      await expect(roomService.getRoom('Fab1', 999)).rejects.toThrow('Room not found');

      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room not found' }));
    });
  });
});
describe('updateRoom', () => {
  test('should update room successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ exists: true }] }) // room exists
      .mockResolvedValueOnce(); // update success

    await expect(roomService.updateRoom(1, 'New Room Name', 5)).resolves.toBeUndefined();

    expect(pool.query).toHaveBeenNthCalledWith(1, 'SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)', [1]);
    expect(pool.query).toHaveBeenNthCalledWith(2, 'UPDATE rooms SET rackNum = $1, name = $2,updatedAt = NOW() WHERE id = $3', [
      5,
      'New Room Name',
      1,
    ]);
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room 1 updated' }));
  });

  test('should throw error if room not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // room not exists

    await expect(roomService.updateRoom(99, 'Name', 3)).rejects.toThrow('Room not found');

    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room not found' }));
  });
});

describe('deleteRoom', () => {
  test('should delete room successfully', async () => {
    const mockClient = {
      query: jest
        .fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // advisory lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // room exists
        .mockResolvedValueOnce({ rows: [{ exists: false }] }) // no racks exist (room empty)
        .mockResolvedValueOnce() // delete room
        .mockResolvedValueOnce() // update fabs roomNum
        .mockResolvedValueOnce() // advisory unlock
        .mockResolvedValueOnce(), // COMMIT
      release: jest.fn(),
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fab exists
      .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // fab id

    pool.connect.mockResolvedValue(mockClient);

    await expect(roomService.deleteRoom('Fab1', 1)).resolves.toBeUndefined();

    expect(pool.query).toHaveBeenCalledTimes(2); // fab check & id get
    expect(pool.connect).toHaveBeenCalledTimes(1);

    expect(mockClient.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(mockClient.query).toHaveBeenNthCalledWith(2, 'SELECT pg_advisory_lock($1)', [expect.any(Number)]);
    expect(mockClient.query).toHaveBeenNthCalledWith(3, 'SELECT EXISTS(SELECT 1 FROM rooms WHERE id = $1)', [1]);
    expect(mockClient.query).toHaveBeenNthCalledWith(4, 'SELECT EXISTS(SELECT 1 FROM racks WHERE roomId = $1)', [1]);
    expect(mockClient.query).toHaveBeenNthCalledWith(5, 'DELETE FROM rooms WHERE id = $1', [1]);
    expect(mockClient.query).toHaveBeenNthCalledWith(6, 'UPDATE fabs SET roomNum = roomNum - 1,updatedAt = NOW() WHERE name=$1;', ['Fab1']);
    expect(mockClient.query).toHaveBeenNthCalledWith(7, 'SELECT pg_advisory_unlock($1)', [expect.any(Number)]);
    expect(mockClient.query).toHaveBeenNthCalledWith(8, 'COMMIT');
    expect(mockClient.release).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room 1 deleted' }));
  });

  test('should throw error if fab not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ exists: false }] }); // fab not exist

    await expect(roomService.deleteRoom('InvalidFab', 1)).rejects.toThrow('DC not found');

    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Fab not found' }));
  });

  test('should throw error if room not found', async () => {
    const mockClient = {
      query: jest
        .fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // advisory lock
        .mockResolvedValueOnce({ rows: [{ exists: false }] }), // room not exists
      release: jest.fn(),
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fab exists
      .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // fab id

    pool.connect.mockResolvedValue(mockClient);

    await expect(roomService.deleteRoom('Fab1', 999)).rejects.toThrow('Room not found');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room not found' }));
  });

  test('should throw error if room is not empty', async () => {
    const mockClient = {
      query: jest
        .fn()
        .mockResolvedValueOnce() // BEGIN
        .mockResolvedValueOnce() // advisory lock
        .mockResolvedValueOnce({ rows: [{ exists: true }] }) // room exists
        .mockResolvedValueOnce({ rows: [{ exists: true }] }), // racks exist
      release: jest.fn(),
    };

    pool.query
      .mockResolvedValueOnce({ rows: [{ exists: true }] }) // fab exists
      .mockResolvedValueOnce({ rows: [{ id: 123 }] }); // fab id

    pool.connect.mockResolvedValue(mockClient);

    await expect(roomService.deleteRoom('Fab1', 1)).rejects.toThrow('Room is not Empty');

    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'msg=Room is not Empty' }));
  });
});
