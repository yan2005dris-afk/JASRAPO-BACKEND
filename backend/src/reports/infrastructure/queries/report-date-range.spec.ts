import { normalizeReportDateRange } from './report-date-range';

describe('normalizeReportDateRange', () => {
  it('reportEndDateIncludesEntireSelectedDay', () => {
    const { startInclusive, endExclusive } = normalizeReportDateRange(
      '2024-05-10',
      '2024-05-10',
      'America/Guayaquil',
    );

    const finalInstant = new Date('2024-05-11T04:59:59.999Z');
    const followingDay = new Date('2024-05-11T05:00:00.000Z');

    expect(startInclusive).toEqual(new Date('2024-05-10T05:00:00.000Z'));
    expect(finalInstant.getTime()).toBeLessThan(endExclusive!.getTime());
    expect(endExclusive).toEqual(followingDay);
  });
});
