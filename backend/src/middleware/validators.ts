import type { Request, Response, NextFunction } from 'express';

export const validateNumericId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'id must be a positive integer' });
    return;
  }
  next();
};