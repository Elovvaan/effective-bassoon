export class AnalyticsRepository {
  getOverview(range: string) {
    return {
      range,
      activeUsers: 42,
      submissions: 128,
      gradedAssignments: 110,
    };
  }
}
