import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilters, ExportParams, PaginationParams, Scope } from './types';
import { toCsv } from './analytics.utils';

function parseScope(value: string): Scope {
  if (value === 'class' || value === 'school' || value === 'district') {
    return value;
  }

  throw new Error(`Invalid scope: ${value}`);
}

function parsePagination(query: Request['query']): PaginationParams {
  return {
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined,
  };
}

function parseFilters(query: Request['query']): AnalyticsFilters {
  return {
    startDate: query.startDate?.toString(),
    endDate: query.endDate?.toString(),
    grade: query.grade?.toString(),
    schoolId: query.schoolId?.toString(),
    classId: query.classId?.toString(),
  };
}

function parseExport(query: Request['query']): ExportParams {
  const format = query.format?.toString();

  if (format === 'csv') {
    return { format: 'csv' };
  }

  return { format: 'json' };
}

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const scope = parseScope(req.params.scope);
      const filters = parseFilters(req.query);
      const pagination = parsePagination(req.query);
      const exportParams = parseExport(req.query);

      const response = await this.analyticsService.getAggregations(scope, filters, pagination);

      if (exportParams.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="analytics-${scope}.csv"`);
        res.status(200).send(toCsv(response.data));
        return;
      }

      res.status(200).json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected analytics error';
      res.status(400).json({ message });
    }
  };
}
