const moment = require('moment-timezone');

class DateTimeHelpers {
    static dateFromUnix(unix) {
        return new Date(unix * 1000);
    }

    static unixFromDate(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return Math.floor(date.getTime() / 1000);
    }

    static humanReadable(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        const fallback = moment.utc(date).tz('EDT').format('MMM D h:mm A'); // TODO: variable TZ
        return `<!date^${DateTimeHelpers.unixFromDate(date)}^{date_short} {time}|${fallback}>`;
    }

    static dateOnly(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return moment.utc(date).tz('EDT').format('M/D/YYYY'); // TODO: variable TZ
    }
}

module.exports = DateTimeHelpers;
