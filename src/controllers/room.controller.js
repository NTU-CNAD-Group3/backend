import roomService from '#src/services/room.service.js';

const { createRoom, getHasRack, getRackNum, updateRoom } = roomService;

export const createRoomController = async (req, res) => {
  const { name, rackNum, fabId, height } = req.body;
  if (name == null || rackNum == null || fabId == null || height == null) {
    return res.status(400).json({ error: 'name, rackNum, fabId and height are required' });
  }
  try {
    const room = await createRoom(name, rackNum, fabId, height);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: `Can not create room` });
  }
};

export const getHasRackController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  try {
    const hasRack = await getHasRack(id);
    res.status(200).json(hasRack);
  } catch (error) {
    res.status(500).json({ error: `Can not get has rack data id=${id}` });
  }
};

export const getRackNumController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  try {
    const rackNum = await getRackNum(id);
    res.status(200).json(rackNum);
  } catch (error) {
    res.status(500).json({ error: `Can not get rack num data id=${id}` });
  }
};

export const updateRoomController = async (req, res) => {
  const { id, hasRack } = req.body;
  if (id == null || hasRack == null) {
    return res.status(400).json({ error: 'id and hasRack are required' });
  }
  try {
    const room = await updateRoom(id, hasRack);
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: `Can not update room` });
  }
};
