import express from 'express';

import UserRoutes from '@/routes/user.js';
import AdminRoutes from '@/routes/admin.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('This is the API root!');
});

router.use('/users', UserRoutes);
router.use('/admin', AdminRoutes);

export default router;
