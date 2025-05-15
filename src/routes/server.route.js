import express from 'express';

import {
  createServerController,
  deleteServerController,
  getServerController,
  getAllServersController,
  updateServerNameController,
  getServerByTypeController,
  moveServerController,
  repairController,
  brokenController,
  getAllServerBrokenController,
} from '#src/controllers/server.controller.js';
const router = express.Router();

router.post('/', createServerController); // Create a server
router.delete('/', deleteServerController); // Delete a server
router.put('/name', updateServerNameController); // Update a server
router.put('/repair', repairController); // healthy
router.put('/broken', brokenController); // healthy
router.put('/', moveServerController); // move
router.get('/', getServerController); // Get a server by ID
router.get('/allServers', getAllServersController); // Get all servers
router.get('/allBrokenServers', getAllServerBrokenController); // Get all servers
router.get('/searching', getServerByTypeController); // Get a server by search

export default router;
