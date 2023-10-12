import fs from 'fs';
import { Buffer } from 'buffer';
import MerkleTree from './merkle-tree';
import { keccak256 } from 'ethereumjs-util'; // Ensure you have this library installed

// Define the structure of the data in your JSON file
interface User {
  address: string;
  reward: string;
}

interface Pool {
  poolId: string;
  users: User[];
}

interface MerkleRootEntry {
  poolId: string;
  merkleRoot: string;
}

interface UserProofEntry {
  poolId: string;
  address: string;
  reward: string;
  proof: string[];
}

// Read your JSON file and parse it
const rawData = fs.readFileSync('./data/pendingrewards.json', 'utf-8');
const pools: Pool[] = JSON.parse(rawData);

const merkleRoots: MerkleRootEntry[] = [];
const userProofs: UserProofEntry[] = [];

// Process each pool to generate Merkle trees and proofs
for (const pool of pools) {
  // Convert each user's address and reward into a buffer
  const buffers: Buffer[] = pool.users.map(user => {
    const addressBuffer = Buffer.from(user.address.slice(2), 'hex');
    
    // Convert the decimal string reward to a BigInt
    const rewardBigInt = BigInt(user.reward);
    // Convert the BigInt to a hexadecimal string
    let rewardHex = rewardBigInt.toString(16);
    // Pad the reward buffer to make it 12 bytes (24 characters in hex)
    while (rewardHex.length < 24) {
      rewardHex = '0' + rewardHex;
    }
    const rewardBuffer = Buffer.from(rewardHex, 'hex');
    
    // Concatenate and hash the user's address and reward
    const concatenatedData = Buffer.concat([addressBuffer, rewardBuffer]);
    return keccak256(concatenatedData);
  });

  // Create a Merkle tree for the pool
  const merkleTree = new MerkleTree(buffers);

  // Store the Merkle root for the pool
  merkleRoots.push({
    poolId: pool.poolId,
    merkleRoot: merkleTree.getRoot().toString('hex')
  });

  // Generate and store proofs for each user in the pool
  for (const user of pool.users) {
    const concatenatedData = Buffer.concat([Buffer.from(user.address.slice(2), 'hex'), Buffer.from(BigInt(user.reward).toString(16).padStart(24, '0'), 'hex')]);
    const hashedLeaf = keccak256(concatenatedData);
    const proof = merkleTree.getProof(hashedLeaf).map(buf => buf.toString('hex'));

    userProofs.push({
      poolId: pool.poolId,
      address: user.address,
      reward: user.reward,
      proof: proof
    });
  }
}

// Save the Merkle roots to a JSON file
fs.writeFileSync('./outputs/merkle-roots.json', JSON.stringify(merkleRoots, null, 2));

// Save the user proofs to another JSON file
fs.writeFileSync('./outputs/user-proofs.json', JSON.stringify(userProofs, null, 2));
