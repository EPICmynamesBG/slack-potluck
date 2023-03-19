class DateTimeHelpers {
    static dateFromUnix(unix) {
        return new Date(unix * 1000);
    }

    static unixFromDate(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return Math.floor(date.getTime() / 1000);
    }

    static humanReadable(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return date.toLocaleString();
    }

    static dateOnly(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
    }
}

module.exports = DateTimeHelpers;
