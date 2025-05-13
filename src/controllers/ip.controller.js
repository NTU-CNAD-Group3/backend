import ipSerive from '#src/services/ip.service.js';

const { assign, createIpPool, release, getAllIp, getUsedIp, getIpPool, getAllIpPools } = ipSerive;

export const assignController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  const assignedIp = await assign(service);
  res.status(201).json({ data: assignedIp, message: 'Assigned' });
};

export const createIpPoolController = async (req, res) => {
  const { service, cidrBlock } = req.body;
  if (service == null || cidrBlock == null) {
    const error = new Error('Service, cidrBlock are required');
    error.status = 400;
    throw error;
  }
  const ipPool = await createIpPool(service, cidrBlock);
  res.status(201).json({ data: ipPool, message: 'Created' });
};

export const releaseController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  const releasedIP = await release(id);
  res.status(200).json({ data: releasedIP, message: 'Released' });
};

export const getAllIpController = async (req, res) => {
  const { service } = req.query;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  const allIPs = await getAllIp(service);
  res.status(200).json({ data: allIPs, message: 'OK' });
};

export const getUsedIpController = async (req, res) => {
  const { service } = req.query;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  const usedIPs = await getUsedIp(service);
  res.status(200).json({ data: usedIPs, message: 'OK' });
};

export const getIpPoolController = async (req, res) => {
  const { service } = req.query;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  const ipPool = await getIpPool(service);
  res.status(200).json({ data: ipPool, message: 'OK' });
}

export const getAllIpPoolsController = async (req, res) => {
  const ipPools = await getAllIpPools();
  res.status(200).json({ data: ipPools, message: 'OK' });
}