import fabService from '#src/services/fab.service.js';
// getFabDetails, getAllRooms,
const { getAllFabs, getFab, createFab, updateFab, deleteFab } = fabService;

// export const getFabDetailsController = async (req, res) => {
//   const { name } = req.query;
//   if (name == null) {
//     return res.status(400).json({ error: 'Name is required' });
//   }
//   try {
//     const fabDetails = await getFabDetails(name);
//     console.log(fabDetails);
//     res.status(200).json(fabDetails.rows);
//   } catch (error) {
//     res.status(500).json({ error: `Can not get fab details` });
//   }
// };

// export const getAllRoomsController = async (req, res) => {
//   const { id } = req.params;
//   if (id == null) {
//     return res.status(400).json({ error: 'Fab ID is required' });
//   }
//   try {
//     const rooms = await getAllRooms(id);
//     res.status(200).json(rooms);
//   } catch (error) {
//     res.status(500).json({ error: `Can not get all rooms` });
//   }
// };

export const getAllFabsController = async (req, res) => {
  try {
    const fabs = await getAllFabs();
    res.status(200).json({ data: fabs, message: 'OK' });
  } catch (e) {
    const error = e;
    error.status = 500;
    throw error;
  }
};

export const getFabController = async (req, res) => {
  const { id } = req.query;
  if (id == null) {
    const error = new Error('Fab ID is required');
    error.status = 400;
    throw error;
  }
  try {
    const fab = await getFab(id);
    res.status(200).json({ data: fab, message: 'OK' });
  } catch (e) {
    const error = e;
    error.status = 500;
    throw error;
  }
};

export const createFabController = async (req, res) => {
  const { name } = req.body;
  if (name == null) {
    const error = new Error('Name is required');
    error.status = 400;
    throw error;
  }
  try {
    const id = await createFab(name);
    res.status(201).json({ data: id, message: 'Created' });
  } catch (e) {
    const error = e; // new Error('Unknown error');
    error.status = 500;
    throw error;
  }
};

export const updateFabController = async (req, res) => {
  const { id, name, roomNum } = req.body;
  if (id == null || name == null || roomNum == null) {
    const error = new Error('ID, name and roomNum are required');
    error.status = 400;
    throw error;
  }
  try {
    await updateFab(id, name, roomNum);
    res.status(200).json({ message: 'Updated' });
  } catch (e) {
    const error = e;
    error.status = 500;
    throw error;
  }
};

export const deleteFabController = async (req, res) => {
  const { name } = req.body;
  if (name == null) {
    const error = new Error('Name is required');
    error.status = 400;
    throw error;
  }
  try {
    await deleteFab(name);
    res.status(200).json({ message: 'Deleted' });
  } catch (e) {
    const error = e;
    error.status = 500;
    throw error;
  }
};
