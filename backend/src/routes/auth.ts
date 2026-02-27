import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { registerSchema, loginSchema } from '../schemas';
import { registerHandler, loginHandler, profileHandler } from '../controllers/authController';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema, 'body'), registerHandler);
router.post('/login', validate(loginSchema, 'body'), loginHandler);

// Protected route — requires JWT
router.get('/me', authenticate, profileHandler);

export default router;
