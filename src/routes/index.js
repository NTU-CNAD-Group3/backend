import express from 'express';

import AdminRoutes from '#src/routes/admin.js';
import UserRoutes from '#src/routes/user.js';
import FabRoutes from '#src/routes/fab.route.js';
import IpRoutes from '#src/routes/ip.route.js';
import RoomRoutes from '#src/routes/room.route.js';
import RackRoutes from '#src/routes/rack.route.js';
import ServerRoutes from '#src/routes/server.route.js';

const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Backend service is healthy.');
});

router.use('/admin', AdminRoutes);
router.use('/user', UserRoutes);
router.use('/fab', FabRoutes);
router.use('/ip', IpRoutes);
router.use('/room', RoomRoutes);
router.use('/rack', RackRoutes);
router.use('/server', ServerRoutes);

export default router;
