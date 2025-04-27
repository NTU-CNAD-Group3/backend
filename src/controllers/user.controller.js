import userService from '#src/services/user.service.js';

const { addServer, deleteServer } = userService;

export const addServerController = async (req, res) => {
  const { name, service, unit, fabId, roomId, rackId, frontPosition, backPosition } = req.body;
  if (
    name == null ||
    service == null ||
    unit == null ||
    fabId == null ||
    roomId == null ||
    rackId == null ||
    frontPosition == null ||
    backPosition == null
  ) {
    return res.status(400).json({ error: 'Name, service, unit, fabId, roomId, rackId, frontPosition, backPosition are required' });
  }
  try {
    const usedIPs = await addServer(name, service, unit, fabId, roomId, rackId, frontPosition, backPosition);
    res.status(201).json(usedIPs);
  } catch (error) {
    res.status(500).json({ error: `Can not get used IP` });
  }
};

export const deleteServerController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    return res.status(400).json({ error: 'Server ID are required' });
  }
  try {
    const releasedIP = await deleteServer(id);
    res.status(201).json(releasedIP);
  } catch (error) {
    res.status(500).json({ error: `Can not realse IP` });
  }
};

// TODO
// getMaxEmpty()
