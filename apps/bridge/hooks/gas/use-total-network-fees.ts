import { formatUnits } from "viem";

import {
  useNativeToken,
  useToNativeToken,
} from "@/hooks/tokens/use-native-token";
import { useFromChain, useToChain } from "@/hooks/use-chain";
import { useTokenPrice } from "@/hooks/use-prices";
import { isRouteQuote, isRouteTransactionStep } from "@/utils/guards";
import { scaleToNativeTokenDecimals } from "@/utils/native-token-scaling";

import { useBridgeGasEstimate } from "../bridge/use-bridge-gas-estimate";
import { useSelectedBridgeRoute } from "../routes/use-selected-bridge-route";
import { useEstimateFeesPerGas } from "./use-estimate-fees-per-gas";

export const useEstimateTotalNetworkFees = () => {
  const from = useFromChain();
  const to = useToChain();

  const fromFeeData = useEstimateFeesPerGas(from?.id);
  const toFeeData = useEstimateFeesPerGas(to?.id);

  const fromNativeToken = useNativeToken();
  const toNativeToken = useToNativeToken();

  const route = useSelectedBridgeRoute();

  const bridgeGasEstimate = useBridgeGasEstimate();

  const fromNativeTokenPrice = useTokenPrice(fromNativeToken ?? null);
  const toNativeTokenPrice = useTokenPrice(toNativeToken ?? null);

  const fromGasPrice =
    fromFeeData.data?.gasPrice ?? fromFeeData.data?.maxFeePerGas ?? BigInt(0);
  const toGasPrice =
    toFeeData.data?.gasPrice ?? toFeeData.data?.maxFeePerGas ?? BigInt(0);

  if (route.isLoading) {
    return {
      isLoading: true,
      data: null,
    };
  }

  if (!isRouteQuote(route.data?.result)) {
    return {
      isLoading: false,
      data: null,
    };
  }

  const data = route.data.result.steps.reduce((accum, x, index) => {
    if (isRouteTransactionStep(x)) {
      const fromGas = {
        token: fromNativeToken,
        price: fromNativeTokenPrice,
        gasPrice: fromGasPrice,
      };
      const toGas = {
        token: toNativeToken,
        price: toNativeTokenPrice,
        gasPrice: toGasPrice,
      };

      const gas = parseInt(x.chainId) === from?.id ? fromGas : toGas;
      if (!gas.price) {
        return accum;
      }

      const estimate =
        index === 0
          ? bridgeGasEstimate.data || x.estimatedGasLimit
          : x.estimatedGasLimit;

      const nativeTokenAmount = scaleToNativeTokenDecimals({
        amount: BigInt(estimate) * gas.gasPrice,
        decimals: gas.token?.decimals ?? 18,
      });
      const formattedAmount = parseFloat(
        formatUnits(nativeTokenAmount, gas.token?.decimals ?? 18)
      );
      return gas.price * formattedAmount + accum;
    }

    return accum;
  }, 0);

  return {
    isLoading: false,
    data,
  };
};
