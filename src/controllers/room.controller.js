import roomService from '#src/services/room.service.js';

const { createRooms, getRoom, deleteRoom, updateRoom } = roomService;
export const getRoomController = async (req, res) => {
  const { name, roomId } = req.query;
  if (name == null || roomId == null) {
    const error = new Error('Name and roomId are required');
    error.status = 400;
    throw error;
  }
  const room = await getRoom(name, roomId);
  res.status(200).json({ data: room, message: 'OK' });
};

export const createRoomsController = async (req, res) => {
  const { name, roomNum, roomArray } = req.body;
  if (name == null || roomNum == null || roomArray == null) {
    const error = new Error('Name, roomNum and roomArray are required');
    error.status = 400;
    throw error;
  }
  await createRooms(name, roomNum, roomArray);
  res.status(201).json({ message: 'Created' });
};

export const updateRoomController = async (req, res) => {
  const { id, name, rackNum } = req.body;
  if (id == null || name == null || rackNum == null) {
    const error = new Error('Room id, name and rackNum are required');
    error.status = 400;
    throw error;
  }
  await updateRoom(id, name, rackNum);
  res.status(200).json({ message: 'Updated' });
};
export const deleteRoomController = async (req, res) => {
  const { name, roomId } = req.body;
  if (name == null || roomId == null) {
    const error = new Error('Name and roomId are required');
    error.status = 400;
    throw error;
  }
  await deleteRoom(name, roomId);
  res.status(200).json({ message: 'Deleted' });
};

// export const createRoomController = async (req, res) => {
//   const { name, rackNum, fabId, height } = req.body;
//   if (name == null || rackNum == null || fabId == null || height == null) {
//     return res.status(400).json({ error: 'name, rackNum, fabId and height are required' });
//   }
//   try {
//     const room = await createRoom(name, rackNum, fabId, height);
//     res.status(201).json(room);
//   } catch (error) {
//     res.status(500).json({ error: `Can not create room` });
//   }
// };

// export const getHasRackController = async (req, res) => {
//   const { id } = req.params;
//   if (id == null) {
//     return res.status(400).json({ error: 'Room ID is required' });
//   }
//   try {
//     const hasRack = await getHasRack(id);
//     res.status(200).json(hasRack);
//   } catch (error) {
//     res.status(500).json({ error: `Can not get has rack data id=${id}` });
//   }
// };

// export const getRackNumController = async (req, res) => {
//   const { id } = req.params;
//   if (id == null) {
//     return res.status(400).json({ error: 'Room ID is required' });
//   }
//   try {
//     const rackNum = await getRackNum(id);
//     res.status(200).json(rackNum);
//   } catch (error) {
//     res.status(500).json({ error: `Can not get rack num data id=${id}` });
//   }
// };
