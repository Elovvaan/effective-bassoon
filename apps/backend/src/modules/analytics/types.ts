export type Scope = 'class' | 'school' | 'district';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  grade?: string;
  schoolId?: string;
  classId?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface ExportParams {
  format?: 'json' | 'csv';
}

export interface Submission {
  id: string;
  studentId: string;
  classId: string;
  schoolId: string;
  districtId: string;
  grade: string;
  submittedAt: string;
  score: number;
  rubricScores: RubricScore[];
}

export interface RubricScore {
  criterionId: string;
  criterionName: string;
  score: number;
}

export interface GrowthMetric {
  studentId: string;
  firstScore: number;
  lastScore: number;
  growth: number;
  percentGrowth: number;
}

export interface RubricTrend {
  criterionId: string;
  criterionName: string;
  averageScore: number;
  trendDelta: number;
}

export interface ScopeAggregation {
  scopeId: string;
  scopeName: string;
  submissionCount: number;
  averageScore: number;
  growth: {
    averageGrowth: number;
    medianGrowth: number;
  };
  rubricTrends: RubricTrend[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedAnalyticsResponse {
  data: ScopeAggregation[];
  meta: PaginationMeta;
}

export interface AnalyticsRepository {
  listSubmissions(filters: AnalyticsFilters): Promise<Submission[]>;
  getClassName(classId: string): Promise<string>;
  getSchoolName(schoolId: string): Promise<string>;
  getDistrictName(districtId: string): Promise<string>;
}
