import express from 'express';

import { assignIpController, createIpPoolController, releaseController, getAllIpController, getUsedIpController } from '#src/controllers/ip.controller.js';

const router = express.Router();

router.post('/assign', assignIpController); // Assign an IP address to a fabId and service
router.post('/createIpPool', createIpPoolController); // Create an IP pool for a fabId and service
router.post('/release', releaseController); // release an IP address for a fabId and service
router.get('/AllIp', getAllIpController); // Get all IPs for a fabId and service
router.get('/UsedIp', getUsedIpController); // Get used IPs for a fabId and service

export default router;
