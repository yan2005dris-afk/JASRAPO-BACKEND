import { redactEmail, redactIp, parseUserAgent } from './redact';

describe('redactPii utilities', () => {
  describe('redactEmail', () => {
    it('masks local-part to first char + *** and domain to first char + *** + TLD', () => {
      expect(redactEmail('john.doe@example.com')).toBe('j***@e***.com');
    });

    it('preserves multi-letter TLDs', () => {
      expect(redactEmail('a@b.io')).toBe('a***@b***.io');
    });

    it('returns *** for missing @', () => {
      expect(redactEmail('not-an-email')).toBe('***');
    });

    it('returns *** for empty string', () => {
      expect(redactEmail('')).toBe('***');
    });

    it('returns *** for empty local part', () => {
      expect(redactEmail('@example.com')).toBe('***');
    });

    it('returns *** for empty domain part', () => {
      expect(redactEmail('user@')).toBe('***');
    });

    it('returns *** for domain without TLD', () => {
      expect(redactEmail('user@host')).toBe('***');
    });
  });

  describe('redactIp', () => {
    it('truncates IPv4 to /24 by zeroing the last octet', () => {
      expect(redactIp('192.168.1.42')).toBe('192.168.1.0/24');
    });

    it('truncates IPv4 with smaller first octets', () => {
      expect(redactIp('10.0.0.1')).toBe('10.0.0.0/24');
    });

    it('truncates full IPv6 to first 3 hextets with /48', () => {
      expect(redactIp('2001:db8:85a3:0:8a2e:370:7334:1234')).toBe(
        '2001:db8:85a3::/48',
      );
    });

    it('truncates compressed IPv6 to first 3 hextets with /48', () => {
      expect(redactIp('2001:db8:85a3::8a2e:370:7334')).toBe(
        '2001:db8:85a3::/48',
      );
    });

    it('returns *** for invalid input', () => {
      expect(redactIp('not-an-ip')).toBe('***');
    });

    it('returns *** for empty string', () => {
      expect(redactIp('')).toBe('***');
    });
  });

  describe('parseUserAgent', () => {
    it('extracts Chrome family and major version', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        ),
      ).toBe('Chrome 124');
    });

    it('extracts curl family and major version', () => {
      expect(parseUserAgent('curl/8.4.0')).toBe('curl 8');
    });

    it('returns Unknown for empty UA', () => {
      expect(parseUserAgent('')).toBe('Unknown');
    });
  });
});
