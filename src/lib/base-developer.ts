import { createPublicClient, http, hexToBytes, bytesToHex, concat } from "viem";
import { base } from "viem/chains";

/**
 * Base Developer Utility
 * 
 * Following the "Base Developer Skill" standards for production-ready apps on Base.
 */

// Registered Base Builder Code: "bc_xm6aa6ws"
const NEUROBASE_BUILDER_CODE = "bc_xm6aa6ws";
// ERC-8021 data suffix generated for "bc_xm6aa6ws"
const NEUROBASE_BUILDER_SUFFIX: `0x${string}` = "0x62635f786d3661613677730b0080218021802180218021802180218021";

export const getBuilderCode = () => NEUROBASE_BUILDER_CODE;
export const getBuilderSuffix = (): `0x${string}` => NEUROBASE_BUILDER_SUFFIX;

/**
 * Attaches builder code data suffix to transaction data for attribution
 * Following the ERC-8021 calldata suffix standard
 */
export const attachBuilderCode = (data: `0x${string}`) => {
  return concat([data, hexToBytes(NEUROBASE_BUILDER_SUFFIX)]) as `0x${string}`;
};

/**
 * Checks if the connected wallet supports batch transactions (EIP-5792)
 * Useful for Smart Wallets like Coinbase Smart Wallet
 */
export const checkBatchCapabilities = async (walletClient: any) => {
  try {
    if (!walletClient.getCapabilities) return null;
    const capabilities = await walletClient.getCapabilities();
    return capabilities;
  } catch (error) {
    console.error("Error checking wallet capabilities:", error);
    return null;
  }
};

/**
 * Base Public Client for standard reads
 */
export const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Common Base Contract Addresses
 */
export const BASE_CONTRACTS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  WETH: "0x4200000000000000000000000000000000000006",
  AERODROME_ROUTER: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43",
};
