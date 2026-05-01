import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Response } from 'express';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  let controller: MetricsController;
  let metricsService: MetricsService;

  const mockMetricsService = {
    getMetrics: jest.fn().mockResolvedValue(
      `# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200",route="/"} 100`,
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    controller = module.get<MetricsController>(MetricsController);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return prometheus metrics', async () => {
      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.getMetrics(mockResponse);

      expect(metricsService.getMetrics).toHaveBeenCalled();
      expect(mockResponse.set).toHaveBeenCalledWith(
        'Content-Type',
        'text/plain; version=0.0.4; charset=utf-8',
      );
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should call getMetrics from MetricsService', async () => {
      const result = await metricsService.getMetrics();
      expect(result).toContain('http_requests_total');
    });
  });
});
