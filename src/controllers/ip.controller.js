import { assign, createIpPool } from '#src/services/ip.service.js';

async function assignIpController(req, res) {
  const { fabId, service } = req.body;
  if (!fabId || !service) {
    return res.status(400).json({ error: 'fabId and service are required' });
  }
  try {
    const ip = await assign(fabId, service);
    res.status(200).json(ip);
  } catch (error) {
    res.status(500).json({ error: `Can not assign IP` });
  }
}

async function createIpPoolController(req, res) {
  const { fabId, service } = req.body;
  if (!fabId || !service) {
    return res.status(400).json({ error: 'fabId and service are required' });
  }
  try {
    const ipPool = await createIpPool(fabId, service);
    res.status(201).json(ipPool);
  } catch (error) {
    res.status(500).json({ error: `Can not create IP pool` });
  }
}

export default {
  assignIpController,
  createIpPoolController,
};
