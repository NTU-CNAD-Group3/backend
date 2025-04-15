import { createRack, getMaxEmpty, deleteRack } from '#src/services/rack.service.js';

async function createRackController(req, res) {
  const { name, service, fabId, roomId, height } = req.body;
  if (!name || !service || !fabId || !roomId || !height) {
    return res.status(400).json({ error: 'Name, service, fabId, roomId, and height are required' });
  }
  try {
    const rack = await createRack(name, service, fabId, roomId, height);
    res.status(201).json(rack);
  } catch (error) {
    res.status(500).json({ error: `Can not create rack data name=${name}` });
  }
}

async function getMaxEmptyController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  try {
    const maxEmpty = await getMaxEmpty(id);
    res.status(200).json(maxEmpty);
  } catch (error) {
    res.status(500).json({ error: `Can not get max empty rack data id=${id}` });
  }
}

async function deleteRackController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Rack ID is required' });
  }
  try {
    const rack = await deleteRack(id);
    res.status(200).json(rack);
  } catch (error) {
    res.status(500).json({ error: `Can not delete rack data id=${id}` });
  }
}

export default {
  createRackController,
  getMaxEmptyController,
  deleteRackController,
};
