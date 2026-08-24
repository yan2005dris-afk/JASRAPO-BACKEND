import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

const queueSaturation = new Rate('pdf_queue_saturation');

export const options = {
  vus: Number(__ENV.PDF_LOAD_VUS || 5),
  duration: __ENV.PDF_LOAD_DURATION || '1m',
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<5000'],
    pdf_queue_saturation: ['rate<0.01'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000/api/v1';
const accessToken = __ENV.ACCESS_TOKEN;
const contratoId = __ENV.CONTRATO_ID || '1';

export default function pdfGenerationLoadProfileMeetsAgreedThresholds() {
  const response = http.get(
    `${baseUrl}/reports/account-statement?contratoId=${contratoId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/pdf',
      },
      responseType: 'binary',
      tags: { operation: 'official-pdf' },
    },
  );

  const saturated =
    response.status === 503 &&
    String(response.body).includes('PDF_QUEUE_SATURATED');
  queueSaturation.add(saturated);
  check(response, {
    'official PDF returns 200': (result) => result.status === 200,
    'official PDF has media type': (result) =>
      String(result.headers['Content-Type']).includes('application/pdf'),
    'official PDF is not empty': (result) => result.body.length > 0,
  });
}
