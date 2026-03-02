import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/authenticate';
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from '../schemas';
import { registerHandler, loginHandler, profileHandler, updateProfileHandler, updatePasswordHandler } from '../controllers/authController';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema, 'body'), registerHandler);
router.post('/login', validate(loginSchema, 'body'), loginHandler);

// Protected route — requires JWT
router.get('/me', authenticate, profileHandler);
router.put('/profile', authenticate, validate(updateProfileSchema, 'body'), updateProfileHandler);
router.put('/password', authenticate, validate(updatePasswordSchema, 'body'), updatePasswordHandler);

export default router;
