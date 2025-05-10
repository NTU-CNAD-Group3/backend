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

const {
  getRoomController,
  createRoomsController,
  updateRoomController,
  deleteRoomController,
} = await import('#src/controllers/room.controller.js');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('room.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getRoomController
  test('getRoomController should throw 400 if missing params', async () => {
    const req = { query: { name: null, roomId: null } };
    const res = mockRes();
    await expect(getRoomController(req, res)).rejects.toThrow('Name and roomId are required');
  });

  test('getRoomController should return room data', async () => {
    const req = { query: { name: 'test', roomId: '123' } };
    const res = mockRes();
    const roomData = { id: '123', name: 'test' };
    mockGetRoom.mockResolvedValue(roomData);

    await getRoomController(req, res);

    expect(mockGetRoom).toHaveBeenCalledWith('test', '123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: roomData, message: 'OK' });
  });

  test('getRoomController should throw error if service fails', async () => {
    const req = { query: { name: 'test', roomId: '123' } };
    const res = mockRes();
    mockGetRoom.mockRejectedValue(new Error('DB error'));

    await expect(getRoomController(req, res)).rejects.toThrow('DB error');
  });

  // createRoomsController
  test('createRoomsController should throw 400 if missing params', async () => {
    const req = { body: { name: null, roomNum: null, roomArray: null } };
    const res = mockRes();
    await expect(createRoomsController(req, res)).rejects.toThrow('Name, roomNum and roomArray are required');
  });

  test('createRoomsController should create rooms', async () => {
    const req = { body: { name: 'test', roomNum: 5, roomArray: [1, 2, 3, 4, 5] } };
    const res = mockRes();
    mockCreateRooms.mockResolvedValue();

    await createRoomsController(req, res);

    expect(mockCreateRooms).toHaveBeenCalledWith('test', 5, [1, 2, 3, 4, 5]);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Created' });
  });

  test('createRoomsController should throw error if service fails', async () => {
    const req = { body: { name: 'test', roomNum: 5, roomArray: [] } };
    const res = mockRes();
    mockCreateRooms.mockRejectedValue(new Error('DB error'));

    await expect(createRoomsController(req, res)).rejects.toThrow('DB error');
  });

  // updateRoomController
  test('updateRoomController should throw 400 if missing params', async () => {
    const req = { body: { id: null, name: null, rackNum: null } };
    const res = mockRes();
    await expect(updateRoomController(req, res)).rejects.toThrow('Room id, name and rackNum are required');
  });

  test('updateRoomController should update room', async () => {
    const req = { body: { id: '123', name: 'updated', rackNum: true } };
    const res = mockRes();
    mockUpdateRoom.mockResolvedValue();

    await updateRoomController(req, res);

    expect(mockUpdateRoom).toHaveBeenCalledWith('123', 'updated', true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Updated' });
  });

  test('updateRoomController should throw error if service fails', async () => {
    const req = { body: { id: '123', name: 'updated', rackNum: true } };
    const res = mockRes();
    mockUpdateRoom.mockRejectedValue(new Error('DB error'));

    await expect(updateRoomController(req, res)).rejects.toThrow('DB error');
  });

  // deleteRoomController
  test('deleteRoomController should throw 400 if missing params', async () => {
    const req = { body: { name: null, roomId: null } };
    const res = mockRes();
    await expect(deleteRoomController(req, res)).rejects.toThrow('Name and roomId are required');
  });

  test('deleteRoomController should delete room', async () => {
    const req = { body: { name: 'test', roomId: '123' } };
    const res = mockRes();
    mockDeleteRoom.mockResolvedValue();

    await deleteRoomController(req, res);

    expect(mockDeleteRoom).toHaveBeenCalledWith('test', '123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Deleted' });
  });

  test('deleteRoomController should throw error if service fails', async () => {
    const req = { body: { name: 'test', roomId: '123' } };
    const res = mockRes();
    mockDeleteRoom.mockRejectedValue(new Error('DB error'));

    await expect(deleteRoomController(req, res)).rejects.toThrow('DB error');
  });
});