import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { readFile } from 'node:fs/promises';
import { Agent as HttpAgent } from 'node:http';
import { Agent as HttpsAgent } from 'node:https';
import * as path from 'node:path';
import type { PrismaClient } from '../../../src/generated/prisma/client';

const ASSET_BUCKET = 'institutional-assets';
const ASSET_KEY = 'profiles/v1/logo.jpeg';

export async function seedInstitutionalProfile(
  prisma: PrismaClient,
): Promise<void> {
  await uploadInstitutionalAssets();

  await prisma.perfilInstitucional.upsert({
    where: { version: 'v1' },
    update: {},
    create: {
      version: 'v1',
      vigenteDesde: new Date('1970-01-01T00:00:00.000Z'),
      nombreLegal: 'Junta Administradora del Sistema Regional de Agua Potable',
      nombreComercial: 'OLÓN',
      siglas: 'JASRAPO',
      ruc: '2490016050001',
      decretoNumero: '3327',
      registroOficialNumero: '802',
      registroOficialFecha: new Date('1979-03-29T00:00:00.000Z'),
      fechaFundacion: new Date('1982-09-11T00:00:00.000Z'),
      direccion: 'Av. Santa Lucía e Intiñan (esquina)',
      ubicacion: {
        localidad: 'Olón',
        parroquia: 'Colonche',
        canton: 'Santa Elena',
        provincia: 'Santa Elena',
        pais: 'Ecuador',
      },
      correo: 'juntaaguaolon2017@yahoo.com',
      telefonos: [
        { etiqueta: 'Teléfono', numero: '2788051' },
        { etiqueta: 'Presidencia', numero: '0983717499' },
        { etiqueta: 'Tesorería', numero: '0999896280' },
        { etiqueta: 'Secretaría', numero: '0998945560' },
      ],
      representantes: [
        {
          nombres: 'Sr. Humberto Salinas Neira',
          identificacion: '0915233670',
          cargo: 'Representante JASRAPO',
          esPrincipal: true,
        },
      ],
      logoReferencia: {
        contenedor: ASSET_BUCKET,
        clave: ASSET_KEY,
        tipoContenido: 'image/jpeg',
      },
      marcaAguaReferencia: {
        contenedor: ASSET_BUCKET,
        clave: ASSET_KEY,
        tipoContenido: 'image/jpeg',
      },
      textosLegales: {
        convenioPago: {
          introduccionOficina: `En las oficinas de la Junta del Sistema Regional de Agua Potable Olón a los`,
          compromisoUsuario: `se realiza el presente convenio donde se compromete el usuario de la guía`,
          identificacionUsuario: 'a nombre del Sr(a)',
          cuotasMensuales: 'comprometiéndose a cancelar en cuotas',
          inicioConvenio: `mensuales más el consumo generado por meses consecutivos, convenio que rige a partir del periodo`,
          cumplimiento: 'Al dar fiel cumplimiento a lo acordado.',
          pagoEfectivo: 'Las cuotas se cancelan en efectivo a partir de',
          pagosPosteriores:
            'en adelante y así los meses posteriores hasta cancelar la deuda de',
          primeraCuota: 'Comprometiéndose a cancelar la primera cuota de',
          cierre: 'Atentamente',
        },
        actaResponsabilidad: {
          introduccionOficina: `En las oficinas de la Junta Administradora del Sistema Regional de Agua Potable Olón`,
          compromisoUsuario:
            'en mi calidad de usuario, asumo el compromiso de cumplir con lo establecido en la Institución:',
          clausulas: [
            'No utilizar el Agua para otros fines, ya que es mi obligación priorizar el líquido vital para el consumo humano en esta época de escasez (Emergencia Hídrica) como lo manda la Ley Orgánica de Recursos Hídricos Uso y Aprovechamiento del Agua en su Artículo # 86 de los Usos del Agua cuya prioridad A es para el Consumo Humano.',
            'En caso de no cumplir la Junta Administradora del Sistema Regional de Agua Potable "Olón" tiene la potestad de sancionar y reflejar en las planillas sin previa notificación.',
            'No obstruir, manipular, ni mover el medidor de la ubicación respectiva sin previo aviso evitando ser sancionado por infracciones por la Junta Administradora del Sistema Regional de Agua Potable "Olón".',
            'No proveer del líquido vital a terceros ya que cada medidor es para un solo domicilio.',
            'Por morosidad durante un año perderá los derechos de usuario, se retirará el medidor y a futuro que desee solicitar una nueva guía deberá cancelar el valor adeudado que refleja en el sistema para de esta manera proceder con los trámites de rigor para la obtención del nuevo medidor.',
          ],
          cierre:
            'Este compromiso se asume para su cumplimiento dentro de las leyes y reglamentos internos de la Junta y como garantía del uso del agua.',
        },
      },
    },
  });
}

async function uploadInstitutionalAssets(): Promise<void> {
  const endpoint = process.env.STORAGE_ENDPOINT ?? 'localhost';
  const port = Number(process.env.STORAGE_PORT ?? 9000);
  const useSsl = (process.env.STORAGE_USE_SSL ?? 'true') === 'true';
  const verifySsl = (process.env.STORAGE_SSL_VERIFY ?? 'true') !== 'false';
  const client = new S3Client({
    region: 'us-east-1',
    endpoint: `${useSsl ? 'https' : 'http'}://${endpoint}:${port}`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY ?? '',
      secretAccessKey: process.env.STORAGE_SECRET_KEY ?? '',
    },
    requestHandler: new NodeHttpHandler({
      httpAgent: new HttpAgent({ keepAlive: true }),
      httpsAgent: new HttpsAgent({
        keepAlive: true,
        rejectUnauthorized: verifySsl,
      }),
    }),
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: ASSET_BUCKET }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: ASSET_BUCKET }));
  }

  const logoPath = path.resolve(
    __dirname,
    '../../../src/infrastructure/pdf/assets/Logo.jpeg',
  );
  await client.send(
    new PutObjectCommand({
      Bucket: ASSET_BUCKET,
      Key: ASSET_KEY,
      Body: await readFile(logoPath),
      ContentType: 'image/jpeg',
    }),
  );
  client.destroy();
}
