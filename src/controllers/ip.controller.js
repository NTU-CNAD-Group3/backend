import ipSerive from '#src/services/ip.service.js';

const { assign, createIpPool, release, getAllIp, getUsedIp, getIpPool, getAllIpPools } = ipSerive;

export const assignController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  try {
    const assignedIp = await assign(service);
    res.status(201).json({ data: assignedIp, message: 'Assigned' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const createIpPoolController = async (req, res) => {
  const { service, cidrBlock } = req.body;
  if (service == null || cidrBlock == null) {
    const error = new Error('Service, cidrBlock are required');
    error.status = 400;
    throw error;
  }
  try {
    const ipPool = await createIpPool(service, cidrBlock);
    res.status(201).json({ data: ipPool, message: 'Created' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const releaseController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  try {
    const releasedIP = await release(id);
    res.status(200).json({ data: releasedIP, message: 'Released' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const getAllIpController = async (req, res) => {
  const { service } = req.query;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  try {
    const allIPs = await getAllIp(service);
    res.status(200).json({ data: allIPs, message: 'OK' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const getUsedIpController = async (req, res) => {
  const { service } = req.query;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  try {
    const usedIPs = await getUsedIp(service);
    res.status(200).json({ data: usedIPs, message: 'OK' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const getIpPoolController = async (req, res) => {
  const { service } = req.query;
  if (service == null) {
    const error = new Error('Service are required');
    error.status = 400;
    throw error;
  }
  try {
    const ipPool = await getIpPool(service);
    res.status(200).json({ data: ipPool, message: 'OK' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
}

export const getAllIpPoolsController = async (req, res) => {
  try {
    const ipPools = await getAllIpPools();
    res.status(200).json({ data: ipPools, message: 'OK' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
}