import express from 'express';

import AdminRoutes from '#src/routes/admin.js';
import UserRoutes from '#src/routes/user.js';

const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Backend service is healthy.');
});

router.use('/admin', AdminRoutes);
router.use('/user', UserRoutes);

export default router;
