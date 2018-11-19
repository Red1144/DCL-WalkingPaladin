"use strict";
/// <reference path="../typings/dcl.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const Vorpal = require("vorpal");
const init_1 = require("./commands/init");
const link_1 = require("./commands/link");
const preview_1 = require("./commands/preview");
const deploy_1 = require("./commands/deploy");
const pin_1 = require("./commands/pin");
const info_1 = require("./commands/info");
const status_1 = require("./commands/status");
const pkg = require('../package.json');
exports.VERSION = pkg.version;
exports.DELIMITER = 'dcl $';
exports.vorpal = new Vorpal();
function init(options = {}) {
    exports.vorpal.use(init_1.init);
    exports.vorpal.use(preview_1.start);
    exports.vorpal.use(deploy_1.deploy);
    exports.vorpal.use(pin_1.pin);
    exports.vorpal.use(link_1.link);
    exports.vorpal.use(info_1.info);
    exports.vorpal.use(status_1.status);
    exports.vorpal
        .delimiter(exports.DELIMITER)
        .catch('[words...]')
        .option('-v, --version', 'Prints the version of the CLI')
        .action(args => {
        if (args.options.version) {
            exports.vorpal.log(`v${exports.VERSION}`);
        }
    });
    if (process.argv.length > 2) {
        const exists = exports.vorpal.commands.some((command) => command._name === process.argv[2] || command._aliases.includes(process.argv[2]));
        if (exists) {
            exports.vorpal.parse(process.argv);
        }
        else {
            showHelp();
        }
    }
    else {
        showHelp();
    }
}
exports.init = init;
function showHelp() {
    exports.vorpal.log(`\n  Decentraland CLI v${exports.VERSION}`);
    exports.vorpal.execSync('help');
}
