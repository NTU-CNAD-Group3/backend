import roomService from '#src/services/room.service.js';

const { createRoom, getHasRack, getRackNum, updateRoom } = roomService;

export const createRoomController = async (req, res) => {
  const { name, fabId } = req.body;
  if (!name || !fabId) {
    return res.status(400).json({ error: 'Name and fabId are required' });
  }
  try {
    const room = await createRoom(name, fabId);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: `Can not create room data name=${name}` });
  }
};

export const getHasRackController = async (req, res) => {
  const { id } = req.params;
  if (!id) {
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
  if (!id) {
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
  const { id } = req.params;
  const { name, fabId } = req.body;
  if (!id || !name || !fabId) {
    return res.status(400).json({ error: 'ID, name and fabId are required' });
  }
  try {
    const room = await updateRoom(id, name, fabId);
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: `Can not update room data id=${id}` });
  }
};
