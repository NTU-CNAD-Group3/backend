import serverService from '#src/services/server.service.js';

const { createServer, deleteServer, updateServer, getServer, getAllServers, getServerByName, getServerByIp, getAllServerByService } =
  serverService;

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

export const deleteServerController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  const deletedServer = await deleteServer(id);
  res.status(201).json({ data: deletedServer, message: 'Deleted' });
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
};

export const getServerController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    const error = new Error('Server ID are required');
    error.status = 400;
    throw error;
  }
  const server = await getServer(id);
  res.status(201).json({ data: server, message: 'OK' });
};

export const getAllServersController = async (req, res) => {
  const servers = await getAllServers();
  res.status(201).json({ data: servers, message: 'OK' });
};

export const getServerByNameController = async (req, res) => {
  const { name } = req.body;
  if (name == null) {
    return res.status(400).json({ error: 'Server name are required' });
  }
  const server = await getServerByName(name);
  res.status(201).json(server);
};

export const getServerByIpController = async (req, res) => {
  const { ip } = req.body;
  if (ip == null) {
    return res.status(400).json({ error: 'Server IP are required' });
  }
  const server = await getServerByIp(ip);
  res.status(201).json(server);
};

export const getAllServerByServiceController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    return res.status(400).json({ error: 'Server service are required' });
  }
  const servers = await getAllServerByService(service);
  res.status(201).json(servers);
};
