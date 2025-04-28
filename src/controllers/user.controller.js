import userService from '#src/services/user.service.js';

const { addServer, deleteServer, createIpPool } = userService;

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

export const createIpPoolController = async (req, res) => {
  const { service, cidrBlock } = req.body;
  if (service == null || cidrBlock == null) {
    return res.status(400).json({ error: 'service, cidrBlock are required' });
  }
  try {
    const ipPool = await createIpPool(service, cidrBlock);
    res.status(201).json(ipPool);
  } catch (error) {
    res.status(500).json({ error: `Can not create IP pool` });
  }
};
