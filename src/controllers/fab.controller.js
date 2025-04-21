import fabService from '#src/services/fab.service.js';

const { getFabDetails, getAllRooms, getAllFabs, getFab, createFab, updateFab, deleteFab } = fabService;

export const getFabDetailsController = async (req, res) => {
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
};

export const getAllRoomsController = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Fab ID is required' });
  }
  try {
    const rooms = await getAllRooms(id);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: `Can not get all rooms` });
  }
};

export const getAllFabsController = async (req, res) => {
  try {
    const fabs = await getAllFabs();
    res.status(200).json(fabs);
  } catch (error) {
    res.status(500).json({ error: `Can not get all fabs` });
  }
};

export const getFabController = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Fab ID is required' });
  }
  try {
    const fab = await getFab(id);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not get fab` });
  }
};

export const createFabController = async (req, res) => {
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
};

export const updateFabController = async (req, res) => {
  const { id, name, roomNum } = req.body;
  if (!id || !name || !roomNum) {
    return res.status(400).json({ error: 'ID, name and roomNum are required' });
  }
  try {
    const fab = await updateFab(id, name, roomNum);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not update fab` });
  }
};

export const deleteFabController = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  try {
    const fab = await deleteFab(id);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not delete fab` });
  }
};
