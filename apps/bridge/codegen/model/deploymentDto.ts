/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * API
 * API docs
 * OpenAPI spec version: 1.0
 */
import type { DeploymentDtoArbitrumNativeToken } from './deploymentDtoArbitrumNativeToken';
import type { DeploymentDtoConfig } from './deploymentDtoConfig';
import type { DeploymentDtoContractAddresses } from './deploymentDtoContractAddresses';
import type { DeploymentFamily } from './deploymentFamily';
import type { DeploymentDtoStatus } from './deploymentDtoStatus';
import type { DeploymentDtoTos } from './deploymentDtoTos';
import type { DeploymentType } from './deploymentType';

export interface DeploymentDto {
  /** @nullable */
  arbitrumNativeToken: DeploymentDtoArbitrumNativeToken;
  /** @nullable */
  conduitId: string | null;
  config: DeploymentDtoConfig;
  contractAddresses: DeploymentDtoContractAddresses;
  createdAt: string;
  /** @nullable */
  deletedAt: string | null;
  depositDuration: number;
  displayName: string;
  family: DeploymentFamily;
  finalizeDuration: number;
  id: string;
  l1ChainId: number;
  l2ChainId: number;
  name: string;
  /** @nullable */
  proveDuration: number | null;
  /** @nullable */
  provider: string | null;
  /** @nullable */
  rollupNetworkIcon: string | null;
  status: DeploymentDtoStatus;
  /** @nullable */
  tos: DeploymentDtoTos;
  type: DeploymentType;
}
