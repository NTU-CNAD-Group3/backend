import express from 'express';

import AdminRoutes from '../routes/admin.js';

const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Auth service is healthy.');
});

router.use('/admin', AdminRoutes);

export default router;
