import { Address } from "viem";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";

import { ArbRetryableTxAbi } from "@/abis/arbitrum/ArbRetryableTx";
import {
  ArbitrumDepositRetryableDto,
  ArbitrumForcedWithdrawalDto,
} from "@/codegen/model";
import { isArbitrumDeposit } from "@/utils/guards";

import { useDeploymentById } from "../deployments/use-deployment-by-id";

export function useRedeemArbitrum(
  tx: ArbitrumDepositRetryableDto | ArbitrumForcedWithdrawalDto
) {
  const account = useAccount();
  const wallet = useWalletClient();
  const { writeContract, isPending } = useWriteContract();

  const deployment = useDeploymentById(
    isArbitrumDeposit(tx) ? tx.deploymentId : tx.deposit.deploymentId
  );
  const l2TransactionHash = isArbitrumDeposit(tx)
    ? tx.l2TransactionHash
    : tx.deposit.l2TransactionHash;

  const onRedeem = async () => {
    if (!account.address || !wallet.data) {
      return;
    }

    writeContract({
      abi: ArbRetryableTxAbi,
      functionName: "redeem",
      chainId: deployment?.l2ChainId,
      address: "0x000000000000000000000000000000000000006e",
      args: [l2TransactionHash as Address],
    });
  };

  return { write: onRedeem, isLoading: isPending };
}
