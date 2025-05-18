import { jest } from '@jest/globals';

const mockCreateRooms = jest.fn();
const mockGetRoom = jest.fn();
const mockDeleteRoom = jest.fn();
const mockUpdateRoom = jest.fn();

await jest.unstable_mockModule('#src/services/room.service.js', () => ({
  default: {
    createRooms: mockCreateRooms,
    getRoom: mockGetRoom,
    deleteRoom: mockDeleteRoom,
    updateRoom: mockUpdateRoom,
  },
}));

const { getRoomController, createRoomsController, updateRoomController, deleteRoomController } = await import(
  '#src/controllers/room.controller.js'
);

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
// getRoomController ----------------------------------------------------------
// ---------------------------------------------------------------------------
describe('getRoomController', () => {
  test('should return room data', async () => {
    const room = { id: 1, name: 'Room-1' };
    mockGetRoom.mockResolvedValue(room);

    req.query = { name: 'Room-1', roomId: 1 };
    await getRoomController(req, res);

    expect(mockGetRoom).toHaveBeenCalledWith('Room-1', 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: room, message: 'OK' });
  });

  test('should throw 400 if name or roomId missing', async () => {
    req.query = { name: null, roomId: null };

    await expect(getRoomController(req, res)).rejects.toThrow('Name and roomId are required');
    expect(mockGetRoom).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// createRoomsController ------------------------------------------------------
// ---------------------------------------------------------------------------
describe('createRoomsController', () => {
  test('should create rooms and return 201', async () => {
    req.body = {
      fabName: 'Fab-A',
      roomNum: 2,
      roomArray: ['Room1', 'Room2'],
    };

    await createRoomsController(req, res);

    expect(mockCreateRooms).toHaveBeenCalledWith('Fab-A', 2, ['Room1', 'Room2']);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Created' });
  });

  test('should throw 400 if required fields missing', async () => {
    req.body = { fabName: null, roomNum: 1, roomArray: null };

    await expect(createRoomsController(req, res)).rejects.toThrow('fabName, roomNum and roomArray are required');
    expect(mockCreateRooms).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// updateRoomController -------------------------------------------------------
// ---------------------------------------------------------------------------
describe('updateRoomController', () => {
  test('should update room and return 200', async () => {
    req.body = {
      id: 1,
      name: 'Room-B',
      rackNum: 10,
    };

    await updateRoomController(req, res);

    expect(mockUpdateRoom).toHaveBeenCalledWith(1, 'Room-B', 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Updated' });
  });

  test('should throw 400 if required fields missing', async () => {
    req.body = { id: null, name: null, rackNum: null };

    await expect(updateRoomController(req, res)).rejects.toThrow('Room id, name and rackNum are required');
    expect(mockUpdateRoom).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// deleteRoomController -------------------------------------------------------
// ---------------------------------------------------------------------------
describe('deleteRoomController', () => {
  test('should delete room and return 200', async () => {
    req.body = {
      fabName: 'Fab-A',
      roomId: 3,
    };

    await deleteRoomController(req, res);

    expect(mockDeleteRoom).toHaveBeenCalledWith('Fab-A', 3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Deleted' });
  });

  test('should throw 400 if fabName or roomId missing', async () => {
    req.body = { fabName: null, roomId: null };

    await expect(deleteRoomController(req, res)).rejects.toThrow('fabName and roomId are required');
    expect(mockDeleteRoom).not.toHaveBeenCalled();
  });
});
