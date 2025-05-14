import serverService from '#src/services/server.service.js';

const {
  createServer,
  deleteServer,
  moveServer,
  getServer,
  getAllServers,
  repair,
  broken,
  getAllServerBroken,
  updateServerName,
  getServerByType,
} = serverService;
// post
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
  const createdServer = await createServer(name, service, unit, fabId, roomId, rackId, frontPosition, backPosition);
  res.status(201).json({ data: createdServer, message: 'Created' });
};

// put
export const moveServerController = async (req, res) => {
  const { id, newFabId, newRoomId, newRackId, newService, frontPosition, backPosition } = req.body;
  if (
    id == null ||
    newFabId == null ||
    newRoomId == null ||
    newRackId == null ||
    newService == null ||
    frontPosition == null ||
    backPosition == null
  ) {
    const error = new Error('id, newFabId, newRoomId, newRackId, newService, frontPosition, backPosition are required');
    error.status = 400;
    throw error;
  }
  await moveServer(id, newFabId, newRoomId, newRackId, newService, frontPosition, backPosition);
  res.status(200).json({ message: 'Success' });
};

export const updateServerNameController = async (req, res) => {
  const { id, newName } = req.body;
  if (id == null || newName == null) {
    const error = new Error('id, newName are required');
    error.status = 400;
    throw error;
  }
  await updateServerName(id, newName);
  res.status(200).json({ message: 'Updated' });
};
export const repairController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    const error = new Error('id is required');
    error.status = 400;
    throw error;
  }
  await repair(id);
  res.status(200).json({ message: 'Updated' });
};
export const brokenController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    const error = new Error('id is required');
    error.status = 400;
    throw error;
  }
  await broken(id);
  res.status(200).json({ message: 'Updated' });
};
// get
export const getAllServerBrokenController = async (req, res) => {
  const server = await getAllServerBroken();
  res.status(200).json({ data: server, message: 'OK' });
};

export const getServerController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  const server = await getServer(id);
  res.status(200).json({ data: server, message: 'OK' });
};

export const getAllServersController = async (req, res) => {
  const servers = await getAllServers();
  res.status(200).json({ data: servers, message: 'OK' });
};

export const getServerByTypeController = async (req, res) => {
  const { keyword, type, page, size } = req.body;
  if (keyword == null || type == null || page == null || size == null) {
    const error = new Error('Server name are required');
    error.status = 400;
    throw error;
  }
  const server = await getServerByType(keyword, type, page, size);
  res.status(200).json({ data: server, message: 'OK' });
};

// delete
export const deleteServerController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  const deletedServer = await deleteServer(id);
  res.status(200).json({ data: deletedServer, message: 'Deleted' });
};
