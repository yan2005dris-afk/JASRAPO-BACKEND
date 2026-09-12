export class TerceraEdadUtil {
  static readonly EDAD_MINIMA = 65;

  static calcularEdad(
    fechaNacimiento: Date,
    referencia: Date = new Date(),
  ): number {
    let edad = referencia.getFullYear() - fechaNacimiento.getFullYear();
    const diferenciaMes = referencia.getMonth() - fechaNacimiento.getMonth();
    if (
      diferenciaMes < 0 ||
      (diferenciaMes === 0 && referencia.getDate() < fechaNacimiento.getDate())
    ) {
      edad--;
    }
    return edad;
  }

  static aplica(fechaNacimiento?: Date | string | null): boolean {
    if (!fechaNacimiento) return false;
    const fecha = new Date(fechaNacimiento);
    if (Number.isNaN(fecha.getTime())) return false;
    return this.calcularEdad(fecha) >= this.EDAD_MINIMA;
  }
}
