# Dependency Notes

## `node-forge` — planned migration to `node:crypto`

**Status:** Deferred. Not changed in the current cycle.

**Why it stays today:**
- `node-forge` is the implementation behind `xml-signer.service.ts` (SRI/XAdES
  digital signature for electronic invoicing in Ecuador).
- The signing path needs PKCS#12 keystore parsing, X.509 certificate
  construction, CMS/PKCS#7 detached signatures and XAdES-BES timestamp
  extensions. As of Node 22 LTS, `node:crypto` does not yet expose
  high-level PKCS#12 or XAdES primitives, so a full drop-in replacement is
  not available.
- The package is pinned in `package.json` (`node-forge@^1.4.0`) and the
  workspace overrides in `pnpm-workspace.yaml` force `xmldom`, `uuid`,
  `lodash`, `handlebars`, `esbuild` and other transitive deps that have
  historically been the real CVE carriers.

**Why it is on the watchlist:**
- `node-forge` had several historical CVEs (CVE-2022-24771, CVE-2023-0282,
  CVE-2024-26141, etc.). Older majors pre-1.3 are unsafe; current `^1.4.0`
  is the patched line.
- The `@signpdf/signpdf` / `@signpdf/signer-p12` stack also depends on
  `node-forge` internally, so we cannot remove it without removing the
  PDF-signing feature.

**Planned migration:**
1. Track Node 22 LTS releases for native PKCS#12 support in `node:crypto`.
2. When available, isolate `xml-signer.service.ts` behind a small
   `CryptoSigner` port so the implementation can be swapped without
   touching call sites.
3. Migrate the PKCS#12 / XAdES path to native `crypto.subtle` + WebCrypto
   primitives, and remove `node-forge` from both `dependencies` and the
   `pnpm-workspace.yaml` allowBuilds / overrides.

**Until then:** keep `node-forge` patched (≥ 1.4.0), watch
`pnpm audit --prod --audit-level=high` in CI, and treat any new advisory
on `node-forge` as a blocker.
