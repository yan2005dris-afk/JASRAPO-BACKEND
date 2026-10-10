import type { ConfigService } from '@nestjs/config';
import { SriSoapClient } from './sri-soap.client';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

describe('SriSoapClient', () => {
  let client: SriSoapClient;
  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => defaultValue),
  } as unknown as ConfigService;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as unknown as LoggerService;

  const sampleXmlRecepcionResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:validarComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.recepcion">
      <RespuestaRecepcionComprobante>
        <estado>RECIBIDA</estado>
        <comprobantes>
          <comprobante>
            <claveAcceso>1010202601179001234500110010010000001231234567815</claveAcceso>
            <mensajes/>
          </comprobante>
        </comprobantes>
      </RespuestaRecepcionComprobante>
    </ns2:validarComprobanteResponse>
  </soap:Body>
</soap:Envelope>`;

  const sampleXmlDevueltaResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:validarComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.recepcion">
      <RespuestaRecepcionComprobante>
        <estado>DEVUELTA</estado>
        <comprobantes>
          <comprobante>
            <claveAcceso>1010202601179001234500110010010000001231234567815</claveAcceso>
            <mensajes>
              <mensaje>
                <identificador>35</identificador>
                <mensaje>ARCHIVO NO CUMPLE ESTRUCTURA XML</mensaje>
                <informacionAdicional>Error de validación XSD</informacionAdicional>
                <tipo>ERROR</tipo>
              </mensaje>
            </mensajes>
          </comprobante>
        </comprobantes>
      </RespuestaRecepcionComprobante>
    </ns2:validarComprobanteResponse>
  </soap:Body>
</soap:Envelope>`;

  const sampleXmlAutorizacionResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:autorizacionComprobanteResponse xmlns:ns2="http://ec.gob.sri.ws.autorizacion">
      <RespuestaAutorizacionComprobante>
        <claveAccesoConsultada>1010202601179001234500110010010000001231234567815</claveAccesoConsultada>
        <numeroComprobantes>1</numeroComprobantes>
        <autorizaciones>
          <autorizacion>
            <estado>AUTORIZADO</estado>
            <numeroAutorizacion>1010202601179001234500110010010000001231234567815</numeroAutorizacion>
            <fechaAutorizacion>2026-10-10T12:00:00-05:00</fechaAutorizacion>
            <ambiente>PRODUCCION</ambiente>
            <comprobante><![CDATA[<factura id="comprobante">...</factura>]]></comprobante>
            <mensajes/>
          </autorizacion>
        </autorizaciones>
      </RespuestaAutorizacionComprobante>
    </ns2:autorizacionComprobanteResponse>
  </soap:Body>
</soap:Envelope>`;

  beforeEach(() => {
    client = new SriSoapClient(mockConfigService, mockLogger);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validarComprobante', () => {
    it('envía envelope SOAP de recepción y parsea respuesta RECIBIDA', async () => {
      const mockFetch = jest
        .spyOn(global, 'fetch' as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => sampleXmlRecepcionResponse,
        } as any);

      const res = await client.validarComprobante(
        '<factura>test</factura>',
        '1',
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'text/xml; charset=utf-8',
          }),
        }),
      );
      expect(res.estado).toBe('RECIBIDA');
      expect(res.comprobantes?.comprobante[0].claveAcceso).toBe(
        '1010202601179001234500110010010000001231234567815',
      );
    });

    it('parsea correctamente una respuesta DEVUELTA con mensajes de error', async () => {
      jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
        ok: true,
        text: async () => sampleXmlDevueltaResponse,
      } as any);

      const res = await client.validarComprobante(
        '<factura>invalid</factura>',
        '2',
      );

      expect(res.estado).toBe('DEVUELTA');
      expect(res.comprobantes?.comprobante[0].mensajes?.mensaje).toHaveLength(
        1,
      );
      expect(
        res.comprobantes?.comprobante[0].mensajes?.mensaje[0].mensaje,
      ).toBe('ARCHIVO NO CUMPLE ESTRUCTURA XML');
    });

    it('maneja errores SOAP Fault del SRI', async () => {
      const faultXml = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Error interno del SRI</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;

      jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => faultXml,
      } as any);

      await expect(
        client.validarComprobante('<factura>test</factura>', '1'),
      ).rejects.toThrow('SRI SOAP Fault: Error interno del SRI');
    });
  });

  describe('autorizarComprobante', () => {
    it('envía clave de acceso y parsea respuesta AUTORIZADO', async () => {
      const claveAcceso = '1010202601179001234500110010010000001231234567815';

      jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
        ok: true,
        text: async () => sampleXmlAutorizacionResponse,
      } as any);

      const res = await client.autorizarComprobante(claveAcceso);

      expect(res.claveAccesoConsultada).toBe(claveAcceso);
      expect(res.numeroComprobantes).toBe('1');
      expect(res.autorizaciones?.autorizacion[0].estado).toBe('AUTORIZADO');
      expect(res.autorizaciones?.autorizacion[0].numeroAutorizacion).toBe(
        claveAcceso,
      );
    });

    it('falla si la clave de acceso no tiene 49 dígitos', async () => {
      await expect(
        client.autorizarComprobante('clave-invalida'),
      ).rejects.toThrow('La clave de acceso debe tener 49 dígitos');
    });
  });

  describe('enviarYAutorizar', () => {
    it('completa el flujo completo retornando éxito cuando el SRI autoriza el documento', async () => {
      const claveAcceso = '1010202601179001234500110010010000001231234567815';

      jest
        .spyOn(global, 'fetch' as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => sampleXmlRecepcionResponse,
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          text: async () => sampleXmlAutorizacionResponse,
        } as any);

      const result = await client.enviarYAutorizar(
        '<factura>test</factura>',
        claveAcceso,
        1,
        10,
      );

      expect(result.success).toBe(true);
      expect(result.estado).toBe('AUTORIZADO');
      expect(result.numeroAutorizacion).toBe(claveAcceso);
    });

    it('aborta tempranamente si la recepción devuelve DEVUELTA', async () => {
      const claveAcceso = '1010202601179001234500110010010000001231234567815';

      jest.spyOn(global, 'fetch' as any).mockResolvedValueOnce({
        ok: true,
        text: async () => sampleXmlDevueltaResponse,
      } as any);

      const result = await client.enviarYAutorizar(
        '<factura>invalid</factura>',
        claveAcceso,
        1,
        10,
      );

      expect(result.success).toBe(false);
      expect(result.estado).toBe('DEVUELTA');
      expect(result.mensajes).toHaveLength(1);
    });
  });
});
