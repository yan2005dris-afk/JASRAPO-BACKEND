export class TerceraEdadUtil {
  static readonly EDAD_MINIMA = 65;

  // Se compara en UTC para que el resultado no dependa de la zona horaria del servidor.
  static calcularEdad(
    fechaNacimiento: Date,
    referencia: Date = new Date(),
  ): number {
    let edad = referencia.getUTCFullYear() - fechaNacimiento.getUTCFullYear();
    const diferenciaMes =
      referencia.getUTCMonth() - fechaNacimiento.getUTCMonth();
    if (
      diferenciaMes < 0 ||
      (diferenciaMes === 0 &&
        referencia.getUTCDate() < fechaNacimiento.getUTCDate())
    ) {
      edad--;
    }
    return edad;
  }

  static aplica(
    fechaNacimiento?: Date | string | null,
    edadMinima: number = TerceraEdadUtil.EDAD_MINIMA,
  ): boolean {
    if (!fechaNacimiento) return false;
    const fecha = new Date(fechaNacimiento);
    if (Number.isNaN(fecha.getTime())) return false;
    return this.calcularEdad(fecha) >= edadMinima;
  }
}
