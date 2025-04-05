import express from 'express';

import UserRoutes from '@/routes/user.js';
import AdminRoutes from '@/routes/admin.js';

const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Auth service is healthy.');
});

router.use('/users', UserRoutes);
router.use('/admin', AdminRoutes);

export default router;
