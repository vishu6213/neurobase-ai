// @ts-nocheck

/**
 * AgentKit Service
 */

let agentInstance: any = null;

export async function getAgent() {
  if (agentInstance) return agentInstance;

  const keyName = process.env.CDP_API_KEY_NAME?.replace(/^["']|["']$/g, '');
  const keySecret = process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');

  if (!keyName || !keySecret) {
    return null;
  }

  try {
    // Dynamically import to avoid import-time crashes in environments where native bindings fail
    const {
      AgentKit,
      wethActionProvider,
      walletActionProvider,
      erc20ActionProvider,
      cdpApiActionProvider,
      cdpEvmWalletActionProvider,
      pythActionProvider,
    } = await import("@coinbase/agentkit");

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
          apiKeyName: keyName,
          apiKeySecret: keySecret,
        }),
        // @ts-ignore
        cdpEvmWalletActionProvider(),
        pythActionProvider(),
      ],
    });

    return agentInstance;
  } catch (error) {
    console.error("[AgentKit] Failed to initialize dynamic AgentKit instance:", error);
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
