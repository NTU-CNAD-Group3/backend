import ipSerive from '#src/services/ip.service.js';

const { assign, createIpPool } = ipSerive;

export const assignIpController = async (req, res) => {
  const { ip, fabId, roomId, rackId } = req.body;
  if (!ip || !fabId || !roomId || !rackId) {
    return res.status(400).json({ error: 'IP, fabId, roomId, and rackId are required' });
  }
  try {
    const assignedIp = await assign(ip, fabId, roomId, rackId);
    res.status(201).json(assignedIp);
  } catch (error) {
    res.status(500).json({ error: `Can not assign IP` });
  }
};

export const createIpPoolController = async (req, res) => {
  const { fabId, roomId, rackId, startIp, endIp } = req.body;
  if (!fabId || !roomId || !rackId || !startIp || !endIp) {
    return res.status(400).json({ error: 'fabId, roomId, rackId, startIp and endIp are required' });
  }
  try {
    const ipPool = await createIpPool(fabId, roomId, rackId, startIp, endIp);
    res.status(201).json(ipPool);
  } catch (error) {
    res.status(500).json({ error: `Can not create IP pool` });
  }
};
