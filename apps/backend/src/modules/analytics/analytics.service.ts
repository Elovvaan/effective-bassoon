import {
  AnalyticsFilters,
  AnalyticsRepository,
  PaginationParams,
  PaginatedAnalyticsResponse,
  Scope,
  ScopeAggregation,
  Submission,
} from './types';
import {
  applySubmissionFilters,
  calculateGrowthMetrics,
  calculateRubricTrends,
  median,
  paginateAggregations,
} from './analytics.utils';

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getAggregations(
    scope: Scope,
    filters: AnalyticsFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedAnalyticsResponse> {
    const rawSubmissions = await this.repository.listSubmissions(filters);
    const submissions = applySubmissionFilters(rawSubmissions, filters);
    const grouped = this.groupByScope(scope, submissions);

    const rows = await Promise.all(
      Array.from(grouped.entries()).map(async ([scopeId, groupSubmissions]) =>
        this.buildScopeAggregation(scope, scopeId, groupSubmissions),
      ),
    );

    return paginateAggregations(rows, pagination);
  }

  private groupByScope(scope: Scope, submissions: Submission[]): Map<string, Submission[]> {
    const buckets = new Map<string, Submission[]>();

    for (const submission of submissions) {
      const key =
        scope === 'class'
          ? submission.classId
          : scope === 'school'
            ? submission.schoolId
            : submission.districtId;

      const bucket = buckets.get(key) ?? [];
      bucket.push(submission);
      buckets.set(key, bucket);
    }

    return buckets;
  }

  private async buildScopeAggregation(
    scope: Scope,
    scopeId: string,
    submissions: Submission[],
  ): Promise<ScopeAggregation> {
    const submissionCount = submissions.length;
    const averageScore =
      submissions.reduce((sum, submission) => sum + submission.score, 0) /
      (submissionCount === 0 ? 1 : submissionCount);

    const growthMetrics = calculateGrowthMetrics(submissions);
    const growthValues = growthMetrics.map((metric) => metric.growth);
    const averageGrowth =
      growthValues.reduce((total, value) => total + value, 0) / (growthValues.length === 0 ? 1 : growthValues.length);

    const scopeName = await this.resolveScopeName(scope, scopeId);

    return {
      scopeId,
      scopeName,
      submissionCount,
      averageScore,
      growth: {
        averageGrowth,
        medianGrowth: median(growthValues),
      },
      rubricTrends: calculateRubricTrends(submissions),
    };
  }

  private async resolveScopeName(scope: Scope, scopeId: string): Promise<string> {
    if (scope === 'class') {
      return this.repository.getClassName(scopeId);
    }

    if (scope === 'school') {
      return this.repository.getSchoolName(scopeId);
    }

    return this.repository.getDistrictName(scopeId);
  }
}
