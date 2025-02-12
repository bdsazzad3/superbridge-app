/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * API
 * API docs
 * OpenAPI spec version: 1.0
 */
import type { GetHyperlaneActivityDto } from './getHyperlaneActivityDto';
import type { GetLzActivityDto } from './getLzActivityDto';

export interface GetActivityV4Dto {
  acrossDomains: string[];
  address: string;
  ccipDomains?: string[];
  cctpDomains: string[];
  /** @nullable */
  cursor: string | null;
  deploymentIds: string[];
  hyperlane?: GetHyperlaneActivityDto;
  lz?: GetLzActivityDto;
}
