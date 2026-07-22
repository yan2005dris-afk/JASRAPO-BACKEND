import { lookup } from 'dns/promises';
import type { LookupFunction } from 'node:net';
import { Agent } from 'undici';
import * as ipaddr from 'ipaddr.js';

interface CidrEntry {
  addr: ipaddr.IPv4 | ipaddr.IPv6;
  bits: number;
}

/**
 * CIDR ranges that MUST NOT be reached from the webhook processor.
 * Combined IPv4/IPv6 set covering loopback, link-local (incl. cloud metadata),
 * RFC1918 private, multicast and reserved/unspecified space.
 */
const V4_DANGEROUS_CIDRS: CidrEntry[] = [
  '127.0.0.0/8',
  '169.254.0.0/16',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
  '224.0.0.0/4',
  '0.0.0.0/8',
  '240.0.0.0/4',
].map((cidr) => {
  const [addr, bits] = ipaddr.parseCIDR(cidr);
  return { addr, bits };
});

const V6_DANGEROUS_CIDRS: CidrEntry[] = [
  '::1/128',
  'fe80::/10',
  'fc00::/7',
  'ff00::/8',
  '::/128',
].map((cidr) => {
  const [addr, bits] = ipaddr.parseCIDR(cidr);
  return { addr, bits };
});

export interface ResolvedTarget {
  dispatcher: Agent;
  pinnedIp: string;
  hostname: string;
}

export class SsrfBlockedError extends Error {
  readonly isSsrfBlocked = true;
  constructor(
    message: string,
    readonly hostname: string,
    readonly dangerousIp: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, SsrfBlockedError.prototype);
  }
}

/**
 * Returns true if the given address belongs to ANY of the dangerous ranges.
 * Unparseable input is treated as dangerous (fail-closed).
 */
export function isDangerousIp(ipString: string): boolean {
  let parsed: ipaddr.IPv4 | ipaddr.IPv6;
  try {
    parsed = ipaddr.parse(ipString);
  } catch {
    return true;
  }

  const ranges =
    parsed.kind() === 'ipv4' ? V4_DANGEROUS_CIDRS : V6_DANGEROUS_CIDRS;
  for (const entry of ranges) {
    if (parsed.match(entry.addr, entry.bits)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve a URL's hostname and pin the first PUBLIC IP into a dedicated
 * undici Agent. Fetches done with the returned `dispatcher` reuse that IP
 * instead of re-resolving DNS at connect time, blocking DNS-rebinding SSRF
 * (e.g. a public A-record flipping to 169.254.169.254 between validation
 * and connect).
 */
export async function resolveAndPin(
  urlString: string,
): Promise<ResolvedTarget> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new SsrfBlockedError(`Invalid URL: ${urlString}`, urlString, '');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SsrfBlockedError(
      `Protocol not allowed: ${parsed.protocol}. Only http and https are allowed.`,
      parsed.hostname,
      '',
    );
  }

  const hostname = parsed.hostname;
  if (!hostname) {
    throw new SsrfBlockedError('URL has no hostname', urlString, '');
  }

  let records: Array<{ address: string; family: number }>;
  try {
    records = await lookup(hostname, { all: true });
  } catch (dnsErr) {
    throw new SsrfBlockedError(
      `Could not resolve host "${hostname}": ${(dnsErr as Error).message}`,
      hostname,
      '',
    );
  }

  if (records.length === 0) {
    throw new SsrfBlockedError(
      `DNS returned no addresses for "${hostname}"`,
      hostname,
      '',
    );
  }

  for (const { address } of records) {
    if (isDangerousIp(address)) {
      throw new SsrfBlockedError(
        `Hostname "${hostname}" resolves to dangerous IP ${address}`,
        hostname,
        address,
      );
    }
  }

  const ipv4First = [
    ...records.filter((r) => r.family === 4),
    ...records.filter((r) => r.family === 6),
  ];
  const chosen = ipv4First[0];
  const family: 4 | 6 = chosen.family === 6 ? 6 : 4;
  const pinnedIp = ipaddr.parse(chosen.address).toString();

  const lookupFn: LookupFunction = (_h, _opts, cb) => {
    cb(null, [{ address: pinnedIp, family }]);
  };

  const dispatcher = new Agent({
    connections: 50,
    pipelining: 1,
    connect: { lookup: lookupFn },
  });

  return { dispatcher, pinnedIp, hostname };
}
