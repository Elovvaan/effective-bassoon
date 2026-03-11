import {
  AnalyticsFilters,
  GrowthMetric,
  PaginationMeta,
  PaginationParams,
  RubricTrend,
  ScopeAggregation,
  Submission,
} from './types';

export function applySubmissionFilters(submissions: Submission[], filters: AnalyticsFilters): Submission[] {
  return submissions.filter((submission) => {
    if (filters.startDate && new Date(submission.submittedAt) < new Date(filters.startDate)) {
      return false;
    }

    if (filters.endDate && new Date(submission.submittedAt) > new Date(filters.endDate)) {
      return false;
    }

    if (filters.grade && submission.grade !== filters.grade) {
      return false;
    }

    if (filters.schoolId && submission.schoolId !== filters.schoolId) {
      return false;
    }

    if (filters.classId && submission.classId !== filters.classId) {
      return false;
    }

    return true;
  });
}

export function calculateGrowthMetrics(submissions: Submission[]): GrowthMetric[] {
  const byStudent = new Map<string, Submission[]>();

  for (const submission of submissions) {
    const bucket = byStudent.get(submission.studentId) ?? [];
    bucket.push(submission);
    byStudent.set(submission.studentId, bucket);
  }

  return Array.from(byStudent.entries()).map(([studentId, studentSubmissions]) => {
    const ordered = [...studentSubmissions].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

    const firstScore = ordered[0]?.score ?? 0;
    const lastScore = ordered[ordered.length - 1]?.score ?? 0;
    const growth = lastScore - firstScore;
    const percentGrowth = firstScore === 0 ? 0 : (growth / firstScore) * 100;

    return {
      studentId,
      firstScore,
      lastScore,
      growth,
      percentGrowth,
    };
  });
}

export function calculateRubricTrends(submissions: Submission[]): RubricTrend[] {
  const criterionScores = new Map<string, { criterionName: string; entries: Array<{ submittedAt: string; score: number }> }>();

  for (const submission of submissions) {
    for (const rubricScore of submission.rubricScores) {
      const existing = criterionScores.get(rubricScore.criterionId) ?? {
        criterionName: rubricScore.criterionName,
        entries: [],
      };

      existing.entries.push({ submittedAt: submission.submittedAt, score: rubricScore.score });
      criterionScores.set(rubricScore.criterionId, existing);
    }
  }

  return Array.from(criterionScores.entries()).map(([criterionId, data]) => {
    const sorted = data.entries.sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

    const averageScore =
      sorted.reduce((total, entry) => total + entry.score, 0) /
      (sorted.length === 0 ? 1 : sorted.length);

    const trendDelta = (sorted[sorted.length - 1]?.score ?? 0) - (sorted[0]?.score ?? 0);

    return {
      criterionId,
      criterionName: data.criterionName,
      averageScore,
      trendDelta,
    };
  });
}

export function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 !== 0) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
}

export function paginateAggregations(
  rows: ScopeAggregation[],
  pagination: PaginationParams,
): { data: ScopeAggregation[]; meta: PaginationMeta } {
  const page = Math.max(1, pagination.page ?? 1);
  const pageSize = Math.max(1, Math.min(1000, pagination.pageSize ?? 25));

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;

  return {
    data: rows.slice(start, start + pageSize),
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

export function toCsv(rows: ScopeAggregation[]): string {
  const headers = [
    'scopeId',
    'scopeName',
    'submissionCount',
    'averageScore',
    'averageGrowth',
    'medianGrowth',
    'rubricTrends',
  ];

  const dataLines = rows.map((row) =>
    [
      row.scopeId,
      row.scopeName,
      String(row.submissionCount),
      row.averageScore.toFixed(2),
      row.growth.averageGrowth.toFixed(2),
      row.growth.medianGrowth.toFixed(2),
      JSON.stringify(row.rubricTrends),
    ]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(','),
  );

  return [headers.join(','), ...dataLines].join('\n');
}
