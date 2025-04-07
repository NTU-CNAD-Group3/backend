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

async function addRack(req, res) {
  const { name, service, fabId, roomId, height } = req.body;
  if (!name || !service || !fabId || !roomId || !height) {
    return res.status(400).json({ error: 'Name , service, fabId, roomId, and height are required' });
  }
  try {
    const rack = await adminService.addRack(name, service, fabId, roomId, height);

    res.status(201).json(rack);
  } catch (error) {
    res.status(500).json({ error: `Can not create rack data name=${name}` });
  }
}

async function clearDatabase(req, res) {
  try {
    await adminService.clearDatabase();
    res.status(200).json({ message: 'Database cleared and recreated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear database' });
  }
}

export default {
  watchFab,
  createFab,
  addRack,
  clearDatabase,
};
