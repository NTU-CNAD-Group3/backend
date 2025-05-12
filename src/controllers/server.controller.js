import serverService from '#src/services/server.service.js';

const { createServer, deleteServer, updateServer, getServer, getAllServers, getServerByName, getServerByIp, getAllServerByService } =
  serverService;

export const createServerController = async (req, res) => {
  const { name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition } = req.body;
  if (
    name == null ||
    service == null ||
    ip == null ||
    unit == null ||
    fabId == null ||
    roomId == null ||
    rackId == null ||
    ipPoolId == null ||
    frontPosition == null ||
    backPosition == null
  ) {
    return res
      .status(400)
      .json({ error: 'name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition are required' });
  }
  try {
    const createdServer = await createServer(name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition);
    res.status(201).json(createdServer);
  } catch (error) {
    res.status(500).json({ error: `Can not assign IP` });
  }
};

export const deleteServerController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    return res.status(400).json({ error: 'Server ID are required' });
  }
  try {
    const deletedServer = await deleteServer(id);
    res.status(201).json(deletedServer);
  } catch (error) {
    res.status(500).json({ error: `Can not delete server` });
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
    return res
      .status(400)
      .json({ error: 'id, name, service, ip, unit, fabId, roomId, rackId, ipPoolId, frontPosition, backPosition, healthy are required' });
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
    res.status(201).json(updatedServer);
  } catch (error) {
    res.status(500).json({ error: `Can not update server` });
  }
};

export const getServerController = async (req, res) => {
  const { id } = req.body;
  if (id == null) {
    return res.status(400).json({ error: 'Server ID are required' });
  }
  try {
    const server = await getServer(id);
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ error: `Can not get server by id` });
  }
};

export const getAllServersController = async (req, res) => {
  try {
    const servers = await getAllServers();
    res.status(201).json(servers);
  } catch (error) {
    res.status(500).json({ error: `Can not get all servers` });
  }
};

export const getServerByNameController = async (req, res) => {
  const { name } = req.body;
  if (name == null) {
    return res.status(400).json({ error: 'Server name are required' });
  }
  try {
    const server = await getServerByName(name);
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ error: `Can not get server by name` });
  }
};

export const getServerByIpController = async (req, res) => {
  const { ip } = req.body;
  if (ip == null) {
    return res.status(400).json({ error: 'Server IP are required' });
  }
  try {
    const server = await getServerByIp(ip);
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ error: `Can not get server by ip` });
  }
};

export const getAllServerByServiceController = async (req, res) => {
  const { service } = req.body;
  if (service == null) {
    return res.status(400).json({ error: 'Server service are required' });
  }
  try {
    const servers = await getAllServerByService(service);
    res.status(201).json(servers);
  } catch (error) {
    res.status(500).json({ error: `Can not get server by service` });
  }
};
