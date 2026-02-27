import { Request, Response, NextFunction } from 'express';
import { register, login, getProfile } from '../services/authService';
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
