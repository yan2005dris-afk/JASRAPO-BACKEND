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
  const trimmed = ua.trim();
  if (!trimmed) return UNKNOWN;

  // Check common CLI tools (e.g. curl/8.4.0, PostmanRuntime/7.32.3, etc.)
  const cliMatch = trimmed.match(/^(curl|PostmanRuntime|insomnia|Wget)\/(\d+)/i);
  if (cliMatch) {
    return `${cliMatch[1]} ${cliMatch[2]}`;
  }

  // Standard browsers in order of specificity
  const edgeMatch = trimmed.match(/Edg(?:e|A|iOS)?\/(\d+)/);
  if (edgeMatch) return `Edge ${edgeMatch[1]}`;

  const operaMatch = trimmed.match(/(?:OPR|Opera)\/(\d+)/);
  if (operaMatch) return `Opera ${operaMatch[1]}`;

  const chromeMatch = trimmed.match(/(?:Chrome|CriOS)\/(\d+)/);
  if (chromeMatch) return `Chrome ${chromeMatch[1]}`;

  const firefoxMatch = trimmed.match(/(?:Firefox|FxiOS)\/(\d+)/);
  if (firefoxMatch) return `Firefox ${firefoxMatch[1]}`;

  const safariMatch = trimmed.match(/Version\/(\d+).*Safari/);
  if (safariMatch) return `Safari ${safariMatch[1]}`;

  return UNKNOWN;
}
