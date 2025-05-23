import express from 'express';

import {
  // assignController,
  createIpPoolController,
  // releaseController,
  getAllIpController,
  getUsedIpController,
  getIpPoolController,
  getAllIpPoolsController,
} from '#src/controllers/ip.controller.js';

const router = express.Router();

// router.post('/', assignController); // Assign an IP address to a fabId and service
// router.delete('/', releaseController); // release an IP address for a fabId and service
router.get('/allIp', getAllIpController); // Get all IPs for a fabId and service
router.get('/usedIp', getUsedIpController); // Get used IPs for a fabId and service
router.post('/pool', createIpPoolController); // Create an IP pool for a fabId and service
router.get('/pool', getIpPoolController); // Get IP pool for a fabId and service
router.get('/allPools', getAllIpPoolsController); // Get all IP pools for a fabId and service

export default router;
