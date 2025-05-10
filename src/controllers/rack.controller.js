import rackService from '#src/services/rack.service.js';

const { createRacks, getRack, updateRack, deleteRack } = rackService;

export const createRacksController = async (req, res) => {
  const { fabName, roomId, rackNum, rackArray } = req.body;
  if (fabName == null || roomId == null || rackNum == null || rackArray == null) {
    const error = new Error('fabName, roomId, rackNum and rackArray are required');
    error.status = 400;
    throw error;
  }
  await createRacks(fabName, roomId, rackNum, rackArray);
  res.status(201).json({ message: 'Created' });
};

export const getRackController = async (req, res) => {
  const { fabName, roomId, rackId } = req.query;
  if (fabName == null || roomId == null || rackId == null) {
    const error = new Error('fabName, roomId and rackId are required');
    error.status = 400;
    throw error;
  }
  const rack = await getRack(fabName, roomId, rackId);
  res.status(200).json({ data: rack, message: 'OK' });
};

export const updateRackController = async (req, res) => {
  const { rackId, name } = req.body;
  if (rackId == null || name == null) {
    const error = new Error('rackId and name are required');
    error.status = 400;
    throw error;
  }
  await updateRack(rackId, name);
  res.status(200).json({ message: 'Updated' });
};

export const deleteRackController = async (req, res) => {
  const { rackId, roomId } = req.params;
  if (rackId == null || roomId == null) {
    const error = new Error('rackId and roomId are required');
    error.status = 400;
    throw error;
  }
  await deleteRack(rackId, roomId);
  res.status(200).json({ message: 'Deleted' });
};
// export const getMaxEmptyController = async (req, res) => {
//   const { id } = req.params;
//   if (id == null) {
//     return res.status(400).json({ error: 'Rack ID is required' });
//   }
//   try {
//     const maxEmpty = await getMaxEmpty(id);
//     res.status(200).json(maxEmpty);
//   } catch (error) {
//     throw error;
//   }
// };
