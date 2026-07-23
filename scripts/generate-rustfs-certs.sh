#!/usr/bin/env bash
# Generate self-signed TLS certificates for local RustFS development.
#
# Why this script exists:
#   docker-compose mounts ./certs into the rustfs container at /opt/tls
#   and enables RUSTFS_TLS_PATH there, while the S3 client
#   (backend/src/infrastructure/database/s3-client/s3-client.service.ts)
#   connects with STORAGE_USE_SSL=true. The pair of files below is the
#   minimum RustFS needs to start with TLS enabled.
#
# This generates a 365-day self-signed pair using openssl. It is intended
# ONLY for local dev or staging where the host does not trust a CA.
# The S3 client trusts them at runtime because STORAGE_SSL_VERIFY is
# defaulted to "false" for self-signed scenarios.
#
# Usage:
#   ./scripts/generate-rustfs-certs.sh        # create if missing
#   rm -rf certs && ./scripts/generate-rustfs-certs.sh   # force regenerate

set -euo pipefail

# Resolve repo root regardless of where the script is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CERTS_DIR="${REPO_ROOT}/certs"

CERT_FILE="${CERTS_DIR}/rustfs_cert.pem"
KEY_FILE="${CERTS_DIR}/rustfs_key.pem"

if [ -f "${CERT_FILE}" ] && [ -f "${KEY_FILE}" ]; then
  echo "[certs] Certificados self-signed ya existen en ${CERTS_DIR}."
  echo "[certs] Para regenerar desde cero: rm -rf certs/ && $0"
  exit 0
fi

mkdir -p "${CERTS_DIR}"

# RSA 2048, 365 days. Subject values mirror the cert the project shipped
# with originally (Country/State are placeholders; CN=localhost matches
# the docker-compose STORAGE_ENDPOINT default).
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "${KEY_FILE}" \
  -out    "${CERT_FILE}" \
  -days 365 \
  -subj "/C=EC/ST=Pichincha/L=Quito/O=JASRAPO/OU=dev/CN=localhost" \
  2>/dev/null

# Private key material is sensitive even for dev certs. Lock it down.
chmod 600 "${KEY_FILE}"
chmod 644 "${CERT_FILE}"

echo "[certs] Generado par self-signed (365d, RSA 2048, CN=localhost)"
echo "[certs]   cert: ${CERT_FILE}"
echo "[certs]   key:  ${KEY_FILE}"
echo ""
echo "[certs] Aviso: estos certs son self-signed. El cliente S3 los aceptará"
echo "[certs] solo si STORAGE_SSL_VERIFY=false (default en .env.example), o"
echo "[certs] agregando el cert al truststore del host. Producción DEBE usar"
echo "[certs] un cert firmado por una CA reconocida."
