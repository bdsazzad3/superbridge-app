import { useRouter } from "next/router";
import { useMemo } from "react";

import { useBridgeControllerGetTokens } from "@/codegen/index";
import { useInjectedStore } from "@/state/injected";
import { MultiChainToken } from "@/types/token";

export function useBackendTokens() {
  const router = useRouter();
  const host = useInjectedStore((s) => s.host);

  const response = useBridgeControllerGetTokens(host, {
    hyperlaneWarpRoutes: router.query.hyperlaneWarpRoutes as string | undefined,
  });

  return useMemo(
    () => ({
      isFetching: response.isFetching,
      data: response.data?.data as MultiChainToken[] | undefined,
    }),
    [response.data, response.isFetching]
  );
}
