import fabService from '#src/services/fab.service.js';
const { getFabDetails, getAllRooms, getAllFabs, getFab, createFab, updateFab, deleteFab } = fabService;

export const getFabDetailsController = async (req, res) => {
  const { name } = req.query;
  if (name == null) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const fabDetails = await getFabDetails(name);
    console.log(fabDetails);
    res.status(200).json(fabDetails.rows);
  } catch (error) {
    res.status(500).json({ error: `Can not get fab details` });
  }
};

export const getAllRoomsController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
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
  if (id == null) {
    return res.status(400).json({ message: 'Fab ID is required' });
  }
  try {
    const fab = await getFab(id);
    const data={
      id:fab.id,
      name:fab.name,
      roomNum:fab.roomnum,
      create_time:fab.createat
    }
    res.status(200).json({message:`Get success`, content: data});
  } catch (error) {
    res.status(500).json({ message: `Can not get fab` });
  }
};

export const createFabController = async (req, res) => {
  const { name, roomNum } = req.body;
  if (name == null || roomNum == null) {
    return res.status(400).json({ message: 'Name and roomNum are required' });
  }
  try {
    const fab = await createFab(name, roomNum);
    const data={
      id:fab.id,
      name:fab.name,
      roomNum:fab.roomnum,
      create_time:fab.createat
    }
    res.status(201).json({message:`Create success`, content: data});
  } catch (error) {
    res.status(500).json({ message: `Can not create fab` });
  }
};

export const updateFabController = async (req, res) => {
  const { id, name, roomNum } = req.body;
  if (id == null || name == null || roomNum == null) {
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
  const { name } = req.body;
  if (name == null) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const fab = await deleteFab(name);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not delete fab` });
  }
};
