"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.SCENE_FILE = 'scene.json';
exports.PROJECT_FILE = 'project.json';
exports.PACKAGE_FILE = 'package.json';
exports.DECENTRALAND_FOLDER = '.decentraland';
exports.DCLIGNORE_FILE = '.dclignore';
/**
 * Composes the path to the `.decentraland` folder based on the provided path.
 * @param dir The path to the directory containing the decentraland folder.
 */
function getDecentralandFolderPath(dir) {
    return path.resolve(dir, exports.DECENTRALAND_FOLDER);
}
exports.getDecentralandFolderPath = getDecentralandFolderPath;
/**
 * Composes the path to the `scene.json` file based on the provided path.
 * @param dir The path to the directory containing the scene file.
 */
function getSceneFilePath(dir) {
    return path.resolve(dir, exports.SCENE_FILE);
}
exports.getSceneFilePath = getSceneFilePath;
/**
 * Composes the path to the `package.json` file based on the provided path.
 * @param dir The path to the directory containing the package.json file.
 */
function getPackageFilePath(dir) {
    return path.resolve(dir, exports.PACKAGE_FILE);
}
exports.getPackageFilePath = getPackageFilePath;
/**
 * Composes the path to the `project.json` file based on the provided path.
 * @param dir The path to the directory containing the project file. By default the `.decentraland` folder.
 */
function getProjectFilePath(dir) {
    return path.resolve(dir, exports.DECENTRALAND_FOLDER, exports.PROJECT_FILE);
}
exports.getProjectFilePath = getProjectFilePath;
/**
 * Returns the path to the current working directory.
 */
function getRootPath() {
    return process.cwd();
}
exports.getRootPath = getRootPath;
/**
 * Composes the path to the `.dclignore` file based on the provided path.
 * @param dir The path to the directory containing the .dclignore file.
 */
function getIgnoreFilePath(dir) {
    return path.resolve(dir, exports.DCLIGNORE_FILE);
}
exports.getIgnoreFilePath = getIgnoreFilePath;
/**
 * Returns the path to the node_modules directory.
 * @param dir The path to the directory containing the node_modules directory.
 */
function getNodeModulesPath(dir) {
    return path.resolve(dir, 'node_modules');
}
exports.getNodeModulesPath = getNodeModulesPath;
