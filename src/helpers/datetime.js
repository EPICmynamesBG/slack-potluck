
class DateTimeHelpers {
    static dateFromUnix(unix) {
        return new Date(unix * 1000);
    }

    static unixFromDate(date) {
        return Math.floor(date.getTime() / 1000);
    }

    static humanReadable(date) {
        return date.toLocaleString();
    }
}

module.exports = DateTimeHelpers;
