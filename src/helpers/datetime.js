const moment = require('moment-timezone');

class DateTimeHelpers {
    static dateFromUnix(unix) {
        return new Date(unix * 1000);
    }

    static unixFromDate(date, toTz = moment.tz.guess()) {
        return Math.floor(date.getTime() / 1000);
    }
    
    static humanReadable(date, toTz = 'America/New_York') {
        const fallback = moment.utc(date).tz(toTz).format('MMM D h:mm A');
        return `<!date^${DateTimeHelpers.unixFromDate(date)}^{date_short} {time}|${fallback}>`;
    }

    static dateOnly(date, toTz = 'America/New_York') {
        return moment.utc(date).tz(toTz).format('M/D/YYYY');
    }
}

module.exports = DateTimeHelpers;
