"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcuadorTimezoneUtil = void 0;
const date_fns_tz_1 = require("date-fns-tz");
class EcuadorTimezoneUtil {
    static ECUADOR_TIMEZONE = process.env.TZ || 'America/Guayaquil';
    static toEcuadorTimezone(fecha) {
        return (0, date_fns_tz_1.toZonedTime)(fecha, this.ECUADOR_TIMEZONE);
    }
    static fromEcuadorToUTC(fecha) {
        return (0, date_fns_tz_1.fromZonedTime)(fecha, this.ECUADOR_TIMEZONE);
    }
    static getEcuadorDayOfWeek(fecha) {
        const ecuadorTime = this.toEcuadorTimezone(fecha);
        return ecuadorTime.getDay();
    }
    static getCurrentEcuadorHour() {
        const now = new Date();
        const ecuadorTime = this.toEcuadorTimezone(now);
        return ecuadorTime.getHours();
    }
    static formatAsEcuadorISO(fecha) {
        return (0, date_fns_tz_1.formatInTimeZone)(fecha, this.ECUADOR_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
    }
}
exports.EcuadorTimezoneUtil = EcuadorTimezoneUtil;
//# sourceMappingURL=ecuador-timezone-backend.util.js.map