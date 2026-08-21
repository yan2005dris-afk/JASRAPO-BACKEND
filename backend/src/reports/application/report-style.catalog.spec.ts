import {
  REPORT_STYLE_CATALOG,
  getAllowedStyles,
  isCanonicalOnly,
  isStyleAllowed,
} from './report-style.catalog';
import type { ReportKey } from './report-style.service';

describe('report-style catalog', () => {
  const dualStyleReports: ReportKey[] = [
    'payments-report',
    'connection-history',
    'account-statement',
    'clients-list',
  ];

  it('declares an allowed-style list for every report key', () => {
    for (const [reportKey, styles] of Object.entries(REPORT_STYLE_CATALOG)) {
      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      expect(getAllowedStyles(reportKey as ReportKey)).toBe(styles);
    }
  });

  describe('dual-style families (legacy | modern)', () => {
    it.each(dualStyleReports)('%s allows legacy and modern only', (key) => {
      expect(getAllowedStyles(key)).toEqual(['legacy', 'modern']);
      expect(isStyleAllowed(key, 'legacy')).toBe(true);
      expect(isStyleAllowed(key, 'modern')).toBe(true);
      expect(isStyleAllowed(key, 'unique')).toBe(false);
      expect(isCanonicalOnly(key)).toBe(false);
    });
  });

  describe('canonical-only families (unique)', () => {
    it('payment-agreement is canonical-only', () => {
      expect(getAllowedStyles('payment-agreement')).toEqual(['unique']);
      expect(isCanonicalOnly('payment-agreement')).toBe(true);
      expect(isStyleAllowed('payment-agreement', 'unique')).toBe(true);
      // A legal document must never be rendered with a parallel style.
      expect(isStyleAllowed('payment-agreement', 'legacy')).toBe(false);
      expect(isStyleAllowed('payment-agreement', 'modern')).toBe(false);
    });
  });
});
