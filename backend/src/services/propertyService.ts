import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getChainContext } from '../config/blockchain.js';
import type { PropertyDto, PropertyMetadata } from '../types/property.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory where property metadata JSON files are stored, named as <id>.json
const METADATA_DIR = path.resolve(__dirname, '..', '..', '..', 'metadata');

const loadMetadata = async (id: number): Promise<PropertyMetadata> => {
  const file = path.join(METADATA_DIR, `${id}.json`);
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw) as PropertyMetadata;
};
//reads totalSupply from realEstate then loads the metadata of each property from disk,  tokenURI are for verifying against the chain
export const getAllProperties = async (): Promise<PropertyDto[]> => {
  const { realEstate } = await getChainContext();
  const totalSupply = (await realEstate.totalSupply()).toNumber();

  const properties: PropertyDto[] = [];
  for (let id = 1; id <= totalSupply; id++) {
    const tokenURI = await realEstate.tokenURI(id);
    const metadata = await loadMetadata(id);
    properties.push({ ...metadata, onChainId: id, tokenURI });
  }
  return properties;
};

export const getPropertyMetadata = async (
  id: number,
): Promise<PropertyMetadata> => {
  return loadMetadata(id);
};

//off-chain search across name, address, description and the numerical values as strings
export const searchProperties = async (
  query: string,
): Promise<PropertyDto[]> => {
  const all = await getAllProperties();
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return all;
  }

  return all.filter((p) => {
    const haystack = [
      p.name,
      p.address,
      p.description,
      ...p.attributes.map((a) => `${a.trait_type} ${a.value}`),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
};