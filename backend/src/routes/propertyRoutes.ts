import express from 'express';
import {
  listProperties,
  getMetadata,
  search,
} from '../controllers/propertyController.js';
import { validateNumericId } from '../middleware/validators.js';

const router = express.Router();

//routes:
//GET / - all properties (chain data + metadata)
//GET /search?q= - off-chain filter
//GET /:id/metadata - metadata for a specific property
//search must be declared BEFORE /:id/metadata so Express doesn't match search as a token id
router.get('/', listProperties);
router.get('/search', search);
router.get('/:id/metadata', validateNumericId, getMetadata);

export default router;