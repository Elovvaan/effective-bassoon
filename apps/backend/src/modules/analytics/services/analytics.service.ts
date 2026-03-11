import type { QueryAnalyticsDto } from '../dto/query-analytics.dto.js';
import { AnalyticsRepository } from '../repositories/analytics.repository.js';

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  overview(dto: QueryAnalyticsDto) {
    return this.repository.getOverview(dto.range);
  }
}
