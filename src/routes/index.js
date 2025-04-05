import express from 'express';

<<<<<<< HEAD
import UserRoutes from '@/routes/user.js';
import AdminRoutes from '@/routes/admin.js';

=======
>>>>>>> origin/databasev2
const router = express.Router();

router.get('/healthy', (req, res) => {
  res.send('Auth service is healthy.');
});

<<<<<<< HEAD
router.use('/users', UserRoutes);
router.use('/admin', AdminRoutes);

=======
>>>>>>> origin/databasev2
export default router;
