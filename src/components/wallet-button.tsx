import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

export const WalletButton = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-32 h-10 bg-white/5 rounded-xl animate-pulse" />;

  return (
    <ConnectButton
      accountStatus="address"
      showBalance={false}
      chainStatus="icon"
    />
  );
};
