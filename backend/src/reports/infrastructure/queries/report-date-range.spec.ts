import { normalizeReportDateRange } from './report-date-range';

describe('normalizeReportDateRange', () => {
  it('reportEndDateIncludesEntireSelectedDay', () => {
    const { startInclusive, endExclusive } = normalizeReportDateRange(
      '2024-05-10',
      '2024-05-10',
    );

    const finalInstant = new Date(2024, 4, 10, 23, 59, 59, 999);
    const followingDay = new Date(2024, 4, 11, 0, 0, 0, 0);

    expect(startInclusive).toEqual(new Date(2024, 4, 10, 0, 0, 0, 0));
    expect(finalInstant.getTime()).toBeLessThan(endExclusive!.getTime());
    expect(endExclusive).toEqual(followingDay);
  });
});
