import { getFabDetails, getAllRooms, getAllFabs, getFab, createFab, updateFab, deleteFab } from '#src/services/fab.service.js';

async function getFabDetailsController(req, res) {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const fabDetails = await getFabDetails(name);
    res.status(200).json(fabDetails.rows);
  } catch (error) {
    res.status(500).json({ error: `Can not get fab details` });
  }
}

async function getAllRoomsController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Fab ID is required' });
  }
  try {
    const rooms = await getAllRooms(id);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: `Can not get fab rooms` });
  }
}

async function getAllFabsController(req, res) {
  try {
    const fabs = await getAllFabs();
    res.status(200).json(fabs);
  } catch (error) {
    res.status(500).json({ error: `Can not get all fabs` });
  }
}

async function getFabController(req, res) {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const fab = await getFab(name);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not get fab` });
  }
}

async function createFabController(req, res) {
  const { name, roomNum } = req.body;
  if (!name || !roomNum) {
    return res.status(400).json({ error: 'Name and roomNum are required' });
  }
  try {
    const fab = await createFab(name, roomNum);
    res.status(201).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not create fab` });
  }
}

async function updateFabController(req, res) {
  const { id } = req.params;
  const { name, roomNum } = req.body;
  if (!id || !name || !roomNum) {
    return res.status(400).json({ error: 'ID, name and roomNum are required' });
  }
  try {
    const fab = await updateFab(id, name, roomNum);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not update fab` });
  }
}

async function deleteFabController(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  try {
    await deleteFab(id);
    res.status(200).json({ message: 'Fab deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: `Can not delete fab` });
  }
}

export default {
  getFabDetailsController,
  getAllRoomsController,
  getAllFabsController,
  getFabController,
  createFabController,
  updateFabController,
  deleteFabController,
};
