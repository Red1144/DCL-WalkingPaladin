"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const wrapCommand_1 = require("../utils/wrapCommand");
const Decentraland_1 = require("../lib/Decentraland");
const analytics_1 = require("../utils/analytics");
const logging_1 = require("../utils/logging");
const opn = require("opn");
const errors_1 = require("../utils/errors");
function link(vorpal) {
    vorpal
        .command('link')
        .description('Link scene to Ethereum.')
        .option('-p, --port <number>', 'linker app server port (default is 4044).')
        .option('-hs, --https', 'Use self-signed localhost certificate to use HTTPs at linking app (required for ledger users)')
        .action(wrapCommand_1.wrapCommand((args) => __awaiter(this, void 0, void 0, function* () {
        const dcl = new Decentraland_1.Decentraland({
            linkerPort: args.options.port,
            isHttps: !!args.options.https
        });
        dcl.on('link:ready', url => {
            analytics_1.Analytics.sceneLink();
            const linkerMsg = logging_1.loading(`Linking app ready at ${url}`);
            try {
                opn(url);
            }
            catch (e) {
                vorpal.log(logging_1.warning(`WARNING: Unable to open browser automatically`));
            }
            dcl.on('link:success', () => __awaiter(this, void 0, void 0, function* () {
                analytics_1.Analytics.sceneLinkSuccess();
                linkerMsg.succeed('Project successfully updated in LAND Registry');
                process.exit(1);
            }));
        });
        try {
            yield dcl.link();
        }
        catch (e) {
            errors_1.fail(errors_1.ErrorType.LINKER_ERROR, e.message);
        }
    })));
}
exports.link = link;
