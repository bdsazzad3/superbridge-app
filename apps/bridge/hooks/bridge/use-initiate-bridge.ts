import { waitForTransactionReceipt } from "@wagmi/core";
import { useAccount, useConfig, useWalletClient } from "wagmi";

import { useBridgeControllerTrack } from "@/codegen";
import { ChainDto } from "@/codegen/model";
import { useAcrossDomains } from "@/hooks/across/use-across-domains";
import { useAllowance } from "@/hooks/use-allowance";
import { useFromChain, useToChain } from "@/hooks/use-chain";
import { useDeployment } from "@/hooks/use-deployment";
import { useSelectedToken } from "@/hooks/use-selected-token";
import { useStatusCheck } from "@/hooks/use-status-check";
import { useSwitchChain } from "@/hooks/use-switch-chain";
import { useActiveTokens } from "@/hooks/use-tokens";
import { useWeiAmount } from "@/hooks/use-wei-amount";
import { useConfigState } from "@/state/config";
import { useModalsState } from "@/state/modals";
import { usePendingTransactions } from "@/state/pending-txs";
import { buildPendingTx } from "@/utils/build-pending-tx";
import { isNativeToken } from "@/utils/is-eth";

import { useBridge } from "./use-bridge";
import { trackEvent } from "@/services/ga";
import { isNativeUsdc } from "@/utils/is-usdc";

export const useInitiateBridge = (bridge: ReturnType<typeof useBridge>) => {
  const wallet = useWalletClient();
  const account = useAccount();
  const from = useFromChain();
  const to = useToChain();
  const switchChain = useSwitchChain();
  const tokens = useActiveTokens();
  const weiAmount = useWeiAmount();
  const token = useSelectedToken();

  const deployment = useDeployment();
  const withdrawing = useConfigState.useWithdrawing();
  const stateToken = useConfigState.useToken();
  const forceViaL1 = useConfigState.useForceViaL1();
  const rawAmount = useConfigState.useRawAmount();
  const fast = useConfigState.useFast();
  const nft = useConfigState.useNft();
  const recipient = useConfigState.useRecipientAddress();
  const setToken = useConfigState.useSetToken();
  const setPendingBridgeTransactionHash =
    useModalsState.useSetPendingBridgeTransactionHash();
  const addPendingTransaction = usePendingTransactions.useAddTransaction();
  const updatePendingTransactionHash =
    usePendingTransactions.useUpdateTransactionByHash();
  const statusCheck = useStatusCheck();
  const track = useBridgeControllerTrack();

  const wagmiConfig = useConfig();

  const acrossDomains = useAcrossDomains();
  const allowance = useAllowance(token, bridge.address);

  return async () => {
    if (
      !account.address ||
      !wallet.data ||
      !bridge.valid ||
      !bridge.args ||
      !recipient ||
      statusCheck
    ) {
      return;
    }

    let initiatingChain: ChainDto | undefined;

    if (fast) {
      initiatingChain = acrossDomains.find(
        (x) => x.chain?.id === bridge.args?.tx.chainId
      )?.chain;
    } else if (bridge.args.tx.chainId === deployment?.l1.id) {
      initiatingChain = deployment?.l1;
    } else {
      initiatingChain = deployment?.l2;
    }

    if (!initiatingChain) {
      console.warn("unable to infer initiating chain");
      return;
    }

    if (
      initiatingChain.id !== account.chainId ||
      initiatingChain.id !== wallet.data.chain.id
    ) {
      await switchChain(initiatingChain);
    }

    try {
      const hash = await bridge.write!();

      setPendingBridgeTransactionHash(hash);

       trackEvent({
        event: "bridge",
        from: from?.name ?? "",
        to: to?.name ?? "",
        amount: parseFloat(rawAmount),
        token: token?.symbol ?? "",
        type: fast
          ? "across"
          : !!stateToken && isNativeUsdc(stateToken)
          ? "cctp"
          : withdrawing
          ? "withdraw"
          : "deposit",
        transactionHash: hash,
      });

      if (!fast && deployment) {
        track.mutate({
          data: {
            amount: weiAmount.toString(),
            deploymentId: deployment.id,
            transactionHash: hash,
            action: withdrawing
              ? forceViaL1
                ? "force-withdraw"
                : "withdraw"
              : "deposit",
          },
        });
      }

      const pending = buildPendingTx(
        deployment,
        account.address,
        recipient,
        weiAmount,
        stateToken,
        nft,
        withdrawing,
        hash,
        forceViaL1,
        fast,
        { from: from!, to: to! }
      );
      if (pending) addPendingTransaction(pending);

      if (nft) {
        setToken(tokens.find((x) => isNativeToken(x))!);
      }

      await waitForTransactionReceipt(wagmiConfig, {
        hash,
        chainId: withdrawing
          ? forceViaL1
            ? deployment!.l1.id
            : deployment?.l2.id
          : deployment?.l1.id,
        onReplaced: ({ replacedTransaction, transaction }) => {
          updatePendingTransactionHash(
            replacedTransaction.hash,
            transaction.hash
          );
        },
      });
    } catch (e) {
      console.log(e);
    } finally {
      allowance.refetch();
    }
  };
};
