import adminService from '#src/services/admin.service.js';

async function watchFab(req, res) {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const fabs = await adminService.watchFab(name);
    res.status(200).json(fabs);
  } catch (error) {
    res.status(500).json({ error: `Can not get fabs data` });
  }
}

async function createFab(req, res) {
  const { name, roomNum, rooms } = req.body;
  if (!name || !roomNum || rooms.length === 0) {
    return res.status(400).json({ error: 'Name and rooms are required' });
  }
  try {
    const fab = await adminService.createFab(name, roomNum, rooms);
    res.status(201).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not create fab data name=${name}` });
  }
}

export default {
  watchFab,
  createFab,
};
