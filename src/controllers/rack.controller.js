import rackService from '#src/services/rack.service.js';

const { createRack, getMaxEmpty, deleteRack } = rackService;

export const createRackController = async (req, res) => {
  const { name, service, fabId, roomId, height } = req.body;
  if (name == null || service == null || fabId == null || roomId == null || height == null) {
    return res.status(400).json({ error: 'Name, service, fabId, roomId, and height are required' });
  }
  try {
    const rack = await createRack(name, service, fabId, roomId, height);
    res.status(201).json(rack);
  } catch (error) {
    res.status(500).json({ error: `Can not create rack data name=${name}` });
  }
};

export const getMaxEmptyController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    return res.status(400).json({ error: 'Rack ID is required' });
  }
  try {
    const maxEmpty = await getMaxEmpty(id);
    res.status(200).json(maxEmpty);
  } catch (error) {
    res.status(500).json({ error: `Can not get max empty data id=${id}` });
  }
};

export const deleteRackController = async (req, res) => {
  const { id } = req.params;
  if (id == null) {
    return res.status(400).json({ error: 'Rack ID is required' });
  }
  try {
    const rack = await deleteRack(id);
    res.status(200).json(rack);
  } catch (error) {
    res.status(500).json({ error: `Can not delete rack data id=${id}` });
  }
};
