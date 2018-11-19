"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const ora = require("ora");
function error(message) {
    return chalk_1.default.red(message);
}
exports.error = error;
function comment(message) {
    return chalk_1.default.grey(message);
}
exports.comment = comment;
function warning(message) {
    return chalk_1.default.yellow(message);
}
exports.warning = warning;
function bold(message) {
    return chalk_1.default.bold(message);
}
exports.bold = bold;
function italic(message) {
    return chalk_1.default.italic(message);
}
exports.italic = italic;
function positive(message) {
    return chalk_1.default.green(message);
}
exports.positive = positive;
function info(message) {
    const instance = ora(message).info();
    if (!instance['enabled']) {
        // fallback to show message even when Ora is not supported
        console['log'](message);
    }
}
exports.info = info;
function success(message) {
    const instance = ora(message).succeed();
    if (!instance['enabled']) {
        // fallback to show message even when Ora is not supported
        console['log'](message);
    }
}
exports.success = success;
function loading(message) {
    const spinner = ora(message).start();
    if (!spinner['isSpinning']) {
        // fallback to show message even when Ora is not supported
        console['log'](message);
    }
    return spinner;
}
exports.loading = loading;
function exit(err, logger) {
    logger.log(error('\n' + err.message + '\n'));
    if (process.env.DEBUG)
        logger.log(error(err.stack));
    process.exit(1);
}
exports.exit = exit;
function tabulate(spaces = 0) {
    return spaces > 0 ? ' '.repeat(spaces) : '';
}
exports.tabulate = tabulate;
function isEmpty(obj) {
    if (!obj)
        return true;
    const keys = Object.keys(obj);
    if (!keys.length) {
        return true;
    }
    return keys.every($ => obj[$] === undefined || obj[$] === [] || obj[$] === {} || obj[$] === '');
}
exports.isEmpty = isEmpty;
function formatDictionary(obj, options, level = 1, context) {
    let buf = '';
    const keys = obj ? Object.keys(obj) : [];
    keys.forEach((key, i) => {
        const item = obj[key];
        const separator = context === 'array' && i === 0 ? '' : tabulate(options.spacing * level + options.padding);
        if (Array.isArray(item)) {
            buf = buf.concat(separator, `${chalk_1.default.bold(key)}: `, formatList(item, options, level + 1, 'object'), '\n');
        }
        else if (typeof item === 'object') {
            const isHidden = isEmpty(item);
            const content = isHidden ? `: ${italic('No information available')}\n` : `:\n${formatDictionary(item, options, level + 1, 'object')}`;
            buf = buf.concat(separator, `${chalk_1.default.bold(key)}`, content);
        }
        else if (item) {
            buf = buf.concat(separator, `${chalk_1.default.bold(key)}: `, JSON.stringify(item), '\n');
        }
    });
    return buf;
}
exports.formatDictionary = formatDictionary;
function formatList(list, options, level = 1, context) {
    let buf = '';
    const separator = '\n' + tabulate(options.spacing * level + options.padding) + '- ';
    if (list.length) {
        buf = list.reduce((buf, item, i) => {
            if (Array.isArray(item)) {
                return buf.concat(separator, formatList(list, options, level + 1, 'array'));
            }
            else if (typeof item === 'object') {
                return buf.concat(separator, formatDictionary(item, options, level + 1, 'array'));
            }
            else if (item) {
                return buf.concat(separator, JSON.stringify(item));
            }
        }, '');
    }
    else {
        buf = italic('No information available');
    }
    return buf;
}
exports.formatList = formatList;
