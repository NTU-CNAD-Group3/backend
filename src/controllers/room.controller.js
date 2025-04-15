import { createRoom, getHasRack, getRackNum, updateRoom } from '#src/services/room.service.js';

async function createRoomController(req, res) {
  const { name, rackNum, fabId, height } = req.body;
  if (!name || !rackNum || !fabId || !height) {
    return res.status(400).json({ error: 'Name, rackNum, fabId, and height are required' });
  }
  try {
    const room = await createRoom(name, rackNum, fabId, height);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: `Can not create room data name=${name}` });
  }
}

async function getHasRackController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  try {
    const hasRack = await getHasRack(id);
    res.status(200).json(hasRack);
  } catch (error) {
    res.status(500).json({ error: `Can not get room data id=${id}` });
  }
}

async function getRackNumController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  try {
    const rackNum = await getRackNum(id);
    res.status(200).json(rackNum);
  } catch (error) {
    res.status(500).json({ error: `Can not get room data id=${id}` });
  }
}

async function updateRoomController(req, res) {
  const { id } = req.params;
  const { hasRack } = req.body;
  if (!id || hasRack === undefined) {
    return res.status(400).json({ error: 'Room ID and hasRack are required' });
  }
  try {
    const room = await updateRoom(id, hasRack);
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: `Can not update room data id=${id}` });
  }
}

export default {
  createRoomController,
  getHasRackController,
  getRackNumController,
  updateRoomController,
};
