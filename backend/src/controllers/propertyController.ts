import type { Request, Response } from 'express';
import {
  getAllProperties,
  getPropertyMetadata,
  searchProperties,
} from '../services/propertyService.js';

const sendChainError = (res: Response, error: unknown): void => {
  const message =
    error instanceof Error ? error.message : 'Unknown blockchain error';
  console.error('Blockchain error:', message);
  res.status(503).json({ error: 'Blockchain unavailable', detail: message });
};

export const listProperties = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const properties = await getAllProperties();
    res.status(200).json(properties);
  } catch (error) {
    sendChainError(res, error);
  }
};

export const getMetadata = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const metadata = await getPropertyMetadata(id);
    res.status(200).json(metadata);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      res.status(404).json({ error: `Property ${id} not found` });
      return;
    }
    sendChainError(res, error);
  }
};

export const search = async (req: Request, res: Response): Promise<void> => {
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  try {
    const matches = await searchProperties(query);
    res.status(200).json({ query, count: matches.length, results: matches });
  } catch (error) {
    sendChainError(res, error);
  }
};