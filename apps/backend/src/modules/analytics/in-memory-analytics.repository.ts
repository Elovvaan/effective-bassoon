import { AnalyticsFilters, AnalyticsRepository, Submission } from './types';

export class InMemoryAnalyticsRepository implements AnalyticsRepository {
  constructor(
    private readonly submissions: Submission[],
    private readonly classNames: Record<string, string> = {},
    private readonly schoolNames: Record<string, string> = {},
    private readonly districtNames: Record<string, string> = {},
  ) {}

  async listSubmissions(_filters: AnalyticsFilters): Promise<Submission[]> {
    return this.submissions;
  }

  async getClassName(classId: string): Promise<string> {
    return this.classNames[classId] ?? classId;
  }

  async getSchoolName(schoolId: string): Promise<string> {
    return this.schoolNames[schoolId] ?? schoolId;
  }

  async getDistrictName(districtId: string): Promise<string> {
    return this.districtNames[districtId] ?? districtId;
  }
}
