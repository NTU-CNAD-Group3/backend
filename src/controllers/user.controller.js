import userService from '#src/services/user.service.js';

async function addServer(req, res) {
  const { name, service, unit, fabId, roomId, rackId } = req.body;
  if (!name || !service || !unit || !fabId || !roomId || !rackId) {
    return res.status(400).json({ error: 'Name, service, unit, fabId, roomId, rackId are required' });
  }
  try {
    const fab = await userService.addServer(name, service, unit, fabId, roomId, rackId);

    res.status(201).json(fab);
  } catch (error) {
    res.status(500).json({ error: `Can not addServer data name=${name}` });
  }
}
// TODO
// getMaxEmpty()

export default {
  addServer,
};
