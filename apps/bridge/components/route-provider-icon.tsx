import Image from "next/image";

import { RouteProvider } from "@/codegen/model";

const icons = {
  [RouteProvider.Across]: "/img/alt-bridges/Across-icon.png",
  // TODO: cctp icon
  [RouteProvider.Cctp]: "/img/alt-bridges/Celer-icon.png",
  [RouteProvider.ArbitrumDeposit]: "/img/arbitrum-one/icon.svg",
  [RouteProvider.ArbitrumWithdrawal]: "/img/arbitrum-one/icon.svg",
  [RouteProvider.OptimismDeposit]: "/img/optimism/icon.svg",
  [RouteProvider.OptimismWithdrawal]: "/img/optimism/icon.svg",
  [RouteProvider.OptimismForcedWithdrawal]: "/img/optimism/icon.svg",
  [RouteProvider.Hyperlane]: "/img/alt-bridges/hyperlane.svg",
};

const names = {
  [RouteProvider.Across]: "Across",
  [RouteProvider.Cctp]: "CCTP",
  [RouteProvider.ArbitrumDeposit]: "Native bridge",
  [RouteProvider.ArbitrumWithdrawal]: "Native bridge",
  [RouteProvider.OptimismDeposit]: "Native bridge",
  [RouteProvider.OptimismWithdrawal]: "Native bridge",
  [RouteProvider.OptimismForcedWithdrawal]: "Native bridge",
  [RouteProvider.Hyperlane]: "Hyperlane",
};

export const RouteProviderIcon = ({
  provider,
  className,
}: {
  provider: RouteProvider | null;
  className?: string;
}) => {
  if (!provider) {
    return null;
  }

  return (
    <div className="flex items-center text-xs gap-2">
      <span>{names[provider]}</span>
      <Image
        alt={`${provider} icon`}
        src={icons[provider]}
        className={className}
        height={24}
        width={24}
      />
    </div>
  );
};
