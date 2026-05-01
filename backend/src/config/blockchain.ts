import { ethers } from 'ethers';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//default to localhost and Hardhat's default chain id if not set in environment variables
const RPC_URL: string = process.env.RPC_URL ?? 'http://127.0.0.1:8545';
const CHAIN_ID: string = process.env.CHAIN_ID ?? '31337';

//repo layout: backend/src/config/blockchain.ts -> ../../../src/config.json
const FRONTEND_CONFIG_PATH = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'src',
  'config.json',
);

interface FrontendConfig {
  [chainId: string]: {
    realEstate: { address: string };
    escrow: { address: string };
  };
}

//minimal RealEstate ABI: only totalSupply, tokenURI, and ownerOf are read for the api
const REAL_ESTATE_ABI: string[] = [
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256) view returns (string)',
  'function ownerOf(uint256) view returns (address)',
];

export interface ChainContext {
  provider: ethers.providers.JsonRpcProvider;
  realEstate: ethers.Contract;
  escrowAddress: string;
}

let cached: ChainContext | undefined;

export async function getChainContext(): Promise<ChainContext> {
  if (cached !== undefined) {
    return cached;
  }

  const raw = await fs.readFile(FRONTEND_CONFIG_PATH, 'utf-8');
  const config = JSON.parse(raw) as FrontendConfig;
  const entry = config[CHAIN_ID];

  if (entry === undefined) {
    throw new Error(
      `No deployment found in src/config.json for chain id ${CHAIN_ID}. ` +
        `Run \`npx hardhat run scripts/deploy.js --network localhost\` ` +
        `and update src/config.json.`,
    );
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const realEstate = new ethers.Contract(
    entry.realEstate.address,
    REAL_ESTATE_ABI,
    provider,
  );

  cached = { provider, realEstate, escrowAddress: entry.escrow.address };
  return cached;
}