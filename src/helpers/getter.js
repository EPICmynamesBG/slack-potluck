const _ = require('lodash');

module.exports = function getter(obj, ...attemptFields) {
    if (attemptFields.length === 0) {
        throw new Error('Invalid arg exception');
    }
    var value = undefined;
    for (var prop of attemptFields) {
        value = _.get(obj, prop);
        if (value !== undefined) {
            break;
        }
    }
    return value;
}