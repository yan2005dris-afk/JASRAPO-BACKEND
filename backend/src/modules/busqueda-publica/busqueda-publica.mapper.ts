export class BusquedaPublicaMapper {
  static cliente(cliente: any) {
    const nombre =
      `${cliente?.nombres ?? ''} ${cliente?.apellidos ?? ''}`.trim();

    return {
      tipo: 'cliente',
      id: cliente?.clienteId?.toString(),
      label: nombre || 'Sin nombre',
      extra: {
        identificacion: cliente?.identificacion ?? null,
        telefono: cliente?.telefono ?? null,
        email: cliente?.email ?? null,
      },
    };
  }

  static contrato(contrato: any) {
    const clienteNombre = contrato?.cliente
      ? `${contrato.cliente.nombres ?? ''} ${contrato.cliente.apellidos ?? ''}`.trim()
      : null;

    return {
      tipo: 'contrato',
      id: contrato?.contratoId?.toString(),
      label: contrato?.numeroGuia ?? 'Sin número de guía',
      extra: {
        cliente: clienteNombre,
        identificacionCliente: contrato?.cliente?.identificacion ?? null,
        estado: contrato?.estado ?? null,
        direccion: contrato?.direccionSuministro ?? null,
      },
    };
  }
}
