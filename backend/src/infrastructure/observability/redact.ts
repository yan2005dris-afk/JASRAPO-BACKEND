import { parse } from 'useragent';

const REDACTED = '***';
const UNKNOWN = 'Unknown';

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_HEXTET_PATTERN = /^[0-9a-fA-F]{1,4}$/;

export function redactEmail(email: string): string {
  if (!email || typeof email !== 'string') return REDACTED;

  const at = email.lastIndexOf('@');
  if (at <= 0 || at >= email.length - 1) return REDACTED;

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  const dot = domain.indexOf('.');
  if (dot <= 0 || dot >= domain.length - 1) return REDACTED;

  const domainHead = domain.slice(0, dot);
  const tld = domain.slice(dot + 1);

  return `${local.charAt(0)}***@${domainHead.charAt(0)}***.${tld}`;
}

export function redactIp(ip: string): string {
  if (!ip || typeof ip !== 'string') return REDACTED;

  const v4 = ip.match(IPV4_PATTERN);
  if (v4) {
    return `${v4[1]}.${v4[2]}.${v4[3]}.0/24`;
  }

  if (ip.includes(':')) {
    return redactIpv6(ip);
  }

  return REDACTED;
}

function redactIpv6(ip: string): string {
  const doubleColonIdx = ip.indexOf('::');

  let headHextets: string[];
  if (doubleColonIdx !== -1) {
    const head = ip
      .slice(0, doubleColonIdx)
      .split(':')
      .filter((segment) => segment.length > 0);
    if (head.some((h) => !IPV6_HEXTET_PATTERN.test(h))) return REDACTED;
    headHextets = head.slice(0, 3);
  } else {
    const parts = ip.split(':');
    if (parts.some((p) => !IPV6_HEXTET_PATTERN.test(p))) return REDACTED;
    if (parts.length < 3) return REDACTED;
    headHextets = parts.slice(0, 3);
  }

  while (headHextets.length < 3) headHextets.push('0');
  return `${headHextets.join(':')}:/48`.replace(/:(\/48)$/, '::/48');
}

export function parseUserAgent(ua: string): string {
  if (!ua || typeof ua !== 'string') return UNKNOWN;

  const result = parse(ua);
  const family =
    result.family && result.family !== 'Other' ? result.family : UNKNOWN;
  const major = result.major && result.major !== '0' ? result.major : '';

  if (major) return `${family} ${major}`;
  return family;
}
