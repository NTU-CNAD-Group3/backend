import adminService from '@/models/adminService.js';
async function getAllFabs(req, res) {
  try {
    const fabs = await adminService.getAllFabs();
    res.status(200).json(fabs);
  } catch (error) {
    res.status(500).json({ error: `Can not get fabs data` });
  }
}
async function getFab(req, res) {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const fab = await adminService.getFab(name);
    res.status(200).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not get fab data name=${name}` });
  }
}
async function createFab(req, res) {
  const { name, roomNum } = req.body;
  if (!name || !roomNum) {
    return res.status(400).json({ error: 'Name and roomNum are required' });
  }
  try {
    const fab = await adminService.createFab(name, roomNum);
    res.status(201).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not create fab data name=${name}` });
  }
}
async function updateFab(req, res) {
  const { id, name, roomNum } = req.body;
  if (!id || !name || !roomNum) {
    return res.status(400).json({ error: 'ID, name and roomNum are required' });
  }
  try {
    const updatedFab = await adminService.updateFab(id, name, roomNum);
    if (!updatedFab) {
      return res.status(404).json({ error: 'Fab not found' });
    }
    res.status(200).json(updatedFab);
  } catch (error) {
    res.status(500).json({ error: `Can not update fab data name=${name}` });
  }
}
async function deleteFab(req, res) {
  const { name } = req.body;
  try {
    const deletedFab = await adminService.deleteFab(name);

    if (!deletedFab) {
      return res.status(404).json({ error: 'Fab not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: `Can not delete fab data name=${name}` });
  }
}

export default {
  getAllFabs,
  getFab,
  createFab,
  updateFab,
  deleteFab,
};
