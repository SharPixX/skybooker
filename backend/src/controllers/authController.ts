import { Request, Response, NextFunction } from 'express';
import { register, login, getProfile, updateProfile, updatePassword } from '../services/authService';
import { RegisterBody, LoginBody } from '../schemas';

export async function registerHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, name } = req.body as RegisterBody;
    const result = await register(email, password, name);

    res.status(201).json({
      status: 'ok',
      message: 'Registration successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginBody;
    const result = await login(email, password);

    res.json({
      status: 'ok',
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function profileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getProfile(req.user!.userId);

    res.json({
      status: 'ok',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body as { name: string };
    const user = await updateProfile(req.user!.userId, name);

    res.json({
      status: 'ok',
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
    await updatePassword(req.user!.userId, oldPassword, newPassword);

    res.json({
      status: 'ok',
      message: 'Password updated successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
}
