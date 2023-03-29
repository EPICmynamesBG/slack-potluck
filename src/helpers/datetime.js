class DateTimeHelpers {
    static dateFromUnix(unix) {
        return new Date(unix * 1000);
    }

    static unixFromDate(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return Math.floor(date.getTime() / 1000);
    }

    static humanReadable(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        const fallback = `${date.toLocaleString()} UTC`;
        return `<!date^${this.unixFromDate(date)}^{date_short} {time}|${fallback}>`;
    }

    static dateOnly(date, toTz = Intl.DateTimeFormat().resolvedOptions().timeZone) {
        const fallback = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`;
        return fallback;
        // return `<!date^${this.unixFromDate(date)}^{date_short}|${fallback}>`;
    }
}

module.exports = DateTimeHelpers;
