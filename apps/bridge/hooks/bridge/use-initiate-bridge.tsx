import { waitForTransactionReceipt } from "@wagmi/core";
import { zeroAddress } from "viem";
import { useAccount, useConfig, useWalletClient } from "wagmi";

import { RouteProvider } from "@/codegen/model";
import { useAllowance } from "@/hooks/approvals/use-allowance";
import {
  useDestinationToken,
  useSelectedToken,
} from "@/hooks/tokens/use-token";
import { useChain, useFromChain, useToChain } from "@/hooks/use-chain";
import { useStatusCheck } from "@/hooks/use-status-check";
import { useSwitchChain } from "@/hooks/use-switch-chain";
import { useTrackEvent } from "@/services/ga";
import { useConfigState } from "@/state/config";
import { usePendingTransactions } from "@/state/pending-txs";
import { buildPendingTx } from "@/utils/build-pending-tx";
import { isRouteQuote } from "@/utils/guards";
import { nativeTokenDecimalsTo18Decimals } from "@/utils/native-token-scaling";

import { useAllowanceGasToken } from "../approvals/use-allowance-gas-token";
import { useCcipDomains } from "../ccip/use-ccip-domains";
import { useDeployment } from "../deployments/use-deployment";
import { useHyperlaneMailboxes } from "../hyperlane/use-hyperlane-mailboxes";
import { useLzDomains } from "../lz/use-lz-domains";
import { useSelectedBridgeRoute } from "../routes/use-selected-bridge-route";
import { useNativeToken } from "../tokens/use-native-token";
import { useTokenBalances } from "../use-balances";
import { useInitiatingChainId } from "../use-initiating-chain-id";
import { useReceiveAmount } from "../use-receive-amount";
import { useWeiAmount } from "../use-wei-amount";
import { useIsWithdrawal } from "../use-withdrawing";
import { useBridge } from "./use-bridge";

export const useInitiateBridge = () => {
  const bridge = useBridge();
  const wallet = useWalletClient();
  const account = useAccount();
  const from = useFromChain();
  const to = useToChain();
  const switchChain = useSwitchChain();
  const token = useSelectedToken();
  const trackEvent = useTrackEvent();

  const weiAmount = useWeiAmount();
  const deployment = useDeployment();
  const withdrawing = useIsWithdrawal();
  const fromToken = useSelectedToken();
  const toToken = useDestinationToken();
  const forceViaL1 = useConfigState.useForceViaL1();
  const rawAmount = useConfigState.useRawAmount();
  const recipient = useConfigState.useRecipientAddress();
  const setSubmittingBridge = useConfigState.useSetSubmittingBridge();
  const setSubmittedHash = useConfigState.useSetSubmittedHash();
  const addPendingTransaction = usePendingTransactions.useAddTransaction();
  const updatePendingTransactionHash =
    usePendingTransactions.useUpdateTransactionByHash();
  const statusCheck = useStatusCheck();
  const hyperlaneMailboxes = useHyperlaneMailboxes();
  const lzDomains = useLzDomains();
  const ccipDomains = useCcipDomains();
  const balances = useTokenBalances();
  const receive = useReceiveAmount();

  const gasToken = useNativeToken();

  const initiatingChainId = useInitiatingChainId();
  const initiatingChain = useChain(initiatingChainId);
  const wagmiConfig = useConfig();
  const route = useSelectedBridgeRoute();

  const allowance = useAllowance();
  const gasTokenAllowance = useAllowanceGasToken();

  return async () => {
    if (
      !account.address ||
      !wallet.data ||
      !bridge.valid ||
      !recipient ||
      statusCheck ||
      !initiatingChain ||
      !isRouteQuote(route.data?.result)
    ) {
      return;
    }

    try {
      setSubmittingBridge(true);

      if (
        initiatingChain.id !== account.chainId ||
        initiatingChain.id !== wallet.data.chain.id
      ) {
        await switchChain(initiatingChain);
      }

      const hash = await bridge.write!();

      const type =
        route.data.id === RouteProvider.Hyperlane
          ? "hyperlane"
          : route.data.id === RouteProvider.Across
            ? "across"
            : route.data.id === RouteProvider.Cctp
              ? "cctp"
              : withdrawing
                ? "withdraw"
                : "deposit";

      trackEvent({
        event: "bridge",
        from: from?.name ?? "",
        to: to?.name ?? "",
        amount: parseFloat(rawAmount),
        token: token?.symbol ?? "",
        type,
        transactionHash: hash,
      });

      const inputAmount =
        fromToken?.address === zeroAddress
          ? nativeTokenDecimalsTo18Decimals({
              amount: weiAmount,
              decimals: gasToken?.decimals ?? 18,
            })
          : weiAmount;

      const pending = buildPendingTx(
        deployment,
        account.address,
        recipient,
        inputAmount,
        BigInt(receive.data?.token.raw ?? "0"),
        fromToken,
        toToken,
        withdrawing,
        hash,
        forceViaL1,
        route.data.id,
        hyperlaneMailboxes,
        ccipDomains,
        lzDomains,
        { from: from!, to: to! }
      );
      if (pending) addPendingTransaction(pending);

      setSubmittedHash(hash);

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: initiatingChain.id,
        onReplaced: ({ replacedTransaction, transaction }) => {
          updatePendingTransactionHash(
            replacedTransaction.hash,
            transaction.hash
          );
          setSubmittedHash(transaction.hash);
        },
      });
    } catch (e: any) {
      // todo: when something goes wrong we should toast an error
      if (e.message.includes("rejected")) {
        return;
      }
    } finally {
      allowance.refetch();
      gasTokenAllowance.refetch();
      balances.refetch();

      setSubmittingBridge(false);
    }
  };
};
