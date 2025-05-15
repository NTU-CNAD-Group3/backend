import fabService from '#src/services/fab.service.js';
// getFabDetails, getAllRooms,
const { getAllFabs, getFab, createFab, updateFab, deleteFab } = fabService;

export const getAllFabsController = async (req, res) => {
  const fabs = await getAllFabs();
  res.status(200).json({ data: fabs, message: 'OK' });
};

export const getFabController = async (req, res) => {
  const { name } = req.query;
  if (name == null) {
    const error = new Error('Fab name is required');
    error.status = 400;
    throw error;
  }
  const fab = await getFab(name);
  res.status(200).json({ data: fab, message: 'OK' });
};

export const createFabController = async (req, res) => {
  const { name } = req.body;
  if (name == null) {
    const error = new Error('Name is required');
    error.status = 400;
    throw error;
  }
  const id = await createFab(name);
  res.status(201).json({ data: id, message: 'Created' });
};

export const updateFabController = async (req, res) => {
  const { id, name } = req.body;
  if (id == null || name == null) {
    const error = new Error('ID and name are required');
    error.status = 400;
    throw error;
  }
  await updateFab(id, name);
  res.status(200).json({ message: 'Updated' });
};

export const deleteFabController = async (req, res) => {
  const { name } = req.body;
  if (name == null) {
    const error = new Error('Name is required');
    error.status = 400;
    throw error;
  }
  await deleteFab(name);
  res.status(200).json({ message: 'Deleted' });
};
