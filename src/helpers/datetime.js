const moment = require('moment-timezone');

class DateTimeHelpers {
    static dateFromUnix(unix) {
        return new Date(unix * 1000);
    }

    static unixFromDate(date, toTz = moment.tz.guess()) {
        return Math.floor(date.getTime() / 1000);
    }

    static humanReadable(date, toTz = moment.tz.guess()) {
        return moment.utc(date).tz(toTz).format('M/D/YYYY hh:mm A z');
    }

    static dateOnly(date, toTz = moment.tz.guess()) {
        return moment.utc(date).tz(toTz).format('M/D/YYYY');
    }
}

module.exports = DateTimeHelpers;
