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
const path = require("path");
const filesystem_1 = require("./filesystem");
/**
 * Returns the path to the `.dclinfo` file located in the local HOME folder
 */
function getDCLInfoPath() {
    return path.resolve(filesystem_1.getUserHome(), '.dclinfo');
}
exports.getDCLInfoPath = getDCLInfoPath;
/**
 * Returns the contents of the `.dclinfo` file
 */
function getDCLInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = getDCLInfoPath();
        try {
            const file = yield filesystem_1.readJSON(filePath);
            return file;
        }
        catch (e) {
            return null;
        }
    });
}
exports.getDCLInfo = getDCLInfo;
/**
 * Writes the `.dclinfo` file in the HOME directory
 * @param userId The individual identifier for the CLI user
 * @param trackStats Whether or not user data should be collected
 */
function writeDCLInfo(userId, trackStats) {
    return filesystem_1.writeJSON(getDCLInfoPath(), {
        userId,
        trackStats
    });
}
exports.writeDCLInfo = writeDCLInfo;
