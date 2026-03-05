export declare class EcuadorTimezoneUtil {
    private static readonly ECUADOR_TIMEZONE;
    static toEcuadorTimezone(fecha: Date): Date;
    static fromEcuadorToUTC(fecha: Date): Date;
    static getEcuadorDayOfWeek(fecha: Date): number;
    static getCurrentEcuadorHour(): number;
    static formatAsEcuadorISO(fecha: Date): string;
}
