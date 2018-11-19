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
const analytics_1 = require("../utils/analytics");
const Decentraland_1 = require("../lib/Decentraland");
const logging_1 = require("../utils/logging");
function pin(vorpal) {
    vorpal
        .command('pin')
        .description('Notifies an external IPFS node to pin local files.')
        .option('-h, --host <string>', 'IPFS daemon API host (default is localhost).')
        .option('-p, --port <number>', 'IPFS daemon API port (default is 5001).')
        .action(wrapCommand_1.wrapCommand((args) => __awaiter(this, void 0, void 0, function* () {
        const dcl = new Decentraland_1.Decentraland({
            ipfsHost: args.options.host || 'localhost',
            ipfsPort: args.options.port || 5001
        });
        dcl.on('ipfs:pin', () => {
            analytics_1.Analytics.pinRequest();
            const spinner = logging_1.loading(`Pinning files to IPFS gateway`);
            dcl.on('ipfs:pin-success', () => {
                analytics_1.Analytics.pinSuccess();
                spinner.succeed();
            });
        });
        yield dcl.pin();
    })));
}
exports.pin = pin;
