import ipSerive from '#src/services/ip.service.js';

const { assign, createIpPool, release, getAllIp, getUsedIp } = ipSerive;

export const assignIpController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    return res.status(400).json({ error: 'service are required' });
  }
  try {
    const assignedIp = await assign(service);
    res.status(201).json(assignedIp);
  } catch (error) {
    res.status(500).json({ error: `Can not assign IP` });
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

export const releaseController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    return res.status(400).json({ error: 'Server ID are required' });
  }
  try {
    const releasedIP = await release(id);
    res.status(201).json(releasedIP);
  } catch (error) {
    res.status(500).json({ error: `Can not realse IP` });
  }
};

export const getAllIpController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    return res.status(400).json({ error: 'service are required' });
  }
  try {
    const allIPs = await getAllIp(service);
    res.status(201).json(allIPs);
  } catch (error) {
    res.status(500).json({ error: `Can not get all IP` });
  }
};

export const getUsedIpController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    return res.status(400).json({ error: 'service are required' });
  }
  try {
    const usedIPs = await getUsedIp(service);
    res.status(201).json(usedIPs);
  } catch (error) {
    res.status(500).json({ error: `Can not get used IP` });
  }
};
