/**
 * Generated by orval v6.31.0 🍺
 * Do not edit manually.
 * API
 * API docs
 * OpenAPI spec version: 1.0
 */
import type { RouteFeeItemDto } from './routeFeeItemDto';
import type { InitiatingTransactionDto } from './initiatingTransactionDto';
import type { RouteQuoteDtoStepsItem } from './routeQuoteDtoStepsItem';

export interface RouteQuoteDto {
  fees: RouteFeeItemDto[];
  gasTokenApprovalAddress?: string;
  initiatingTransaction: InitiatingTransactionDto;
  receive: string;
  steps: RouteQuoteDtoStepsItem[];
  tokenApprovalAddress?: string;
}
