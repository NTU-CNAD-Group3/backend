import serverService from '#src/services/server.service.js';

const { createServer, deleteServer, updateServer, getServer, getAllServers } = serverService;

export const createServerController = async (req, res) => {
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
    const error = new Error('Name, service, unit, fabId, roomId, rackId, frontPosition, backPosition are required');
    error.status = 400;
    throw error;
  }
  try {
    const createdServer = await createServer(name, service, unit, fabId, roomId, rackId, frontPosition, backPosition);
    res.status(201).json({ data: createdServer, message: 'Created' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const deleteServerController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  try {
    const deletedServer = await deleteServer(id);
    res.status(201).json({ data: deletedServer, message: 'Deleted' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const updateServerController = async (req, res) => {
  const { id, name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, healthy } = req.body;
  if (
    id == null ||
    name == null ||
    service == null ||
    ip == null ||
    unit == null ||
    fabId == null ||
    roomId == null ||
    rackId == null ||
    ipPoolId == null ||
    frontPosition == null ||
    backPosition == null ||
    healthy == null
  ) {
    const error = new Error('id, name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, healthy are required');
    error.status = 400;
    throw error;
  }
  try {
    const updatedServer = await updateServer(
      id,
      name,
      service,
      ip,
      unit,
      fabId,
      roomId,
      rackId,
      ipPoolId,
      frontPosition,
      backPosition,
      healthy,
    );
    res.status(201).json({ data: updatedServer, message: 'Updated' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const getServerController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  try {
    const server = await getServer(id);
    res.status(201).json({ data: server, message: 'OK' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};

export const getAllServersController = async (req, res) => {
  try {
    const servers = await getAllServers();
    res.status(201).json({ data: servers, message: 'OK' });
  } catch (e) {
    const error = e; 
    error.status = 500;
    throw error;
  }
};