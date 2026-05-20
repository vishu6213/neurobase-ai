// @ts-nocheck
import {
  AgentKit,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpEvmWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";

/**
 * AgentKit Service
 */

let agentInstance: any = null;

export async function getAgent() {
  if (agentInstance) return agentInstance;

  if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_PRIVATE_KEY) {
    return null;
  }

  try {
    // @ts-ignore
    const walletProvider = null; 

    agentInstance = await AgentKit.from({
      walletProvider,
      actionProviders: [
        wethActionProvider(),
        walletActionProvider(),
        // @ts-ignore
        erc20ActionProvider(),
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeySecret: process.env.CDP_API_KEY_PRIVATE_KEY,
        }),
        // @ts-ignore
        cdpEvmWalletActionProvider(),
        pythActionProvider(),
      ],
    });

    return agentInstance;
  } catch (error) {
    return null;
  }
}

export async function executeAgentAction(command: string) {
  const agent = await getAgent();
  if (!agent) {
    return "";
  }
  return `Executing: "${command}"... (Onchain action results would appear here)`;
}
