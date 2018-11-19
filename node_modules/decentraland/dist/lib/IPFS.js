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
const fetch = require("isomorphic-fetch");
const events_1 = require("events");
const env_1 = require("../utils/env");
const errors_1 = require("../utils/errors");
const ipfsAPI = require('ipfs-api');
/**
 * Events emitted by this class:
 *
 * ipfs:pin             - A request for another IPFS node to pin the local files
 * ipfs:pin-success     - The project was successfully pinned by an external node
 * ipfs:add             - Began uploading files to local IPFS node
 * ipfs:add-success     - The files were successfully added to the local IPFS node
 * ipfs:publish         - A request to publish an IPNS hash
 * ipfs:publish-success - The IPNS hash was successfully published
 */
class IPFS extends events_1.EventEmitter {
    constructor(host = 'localhost', port = 5001) {
        super();
        this.ipfsApi = ipfsAPI(host, port.toString());
        if (process.env.IPFS_GATEWAY) {
            this.gateway = process.env.IPFS_GATEWAY;
        }
    }
    /**
     * Generates a new IPFS key (IPNS) and returns it.
     * @param projectId The uuid generated for the project.
     */
    genIPFSKey(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = yield this.ipfsApi.key.gen(projectId, { type: 'rsa', size: 2048 });
                return id;
            }
            catch (e) {
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, `Unable to connect to the IPFS daemon, make sure it is running: https://ipfs.io/docs/getting-started\n${e.message}`);
            }
        });
    }
    /**
     * Returns the peerId from the IPFS api.
     */
    getPeerId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = yield this.ipfsApi.id();
                return id;
            }
            catch (e) {
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, `Unable to connect to the IPFS daemon, make sure it is running: https://ipfs.io/docs/getting-started\n${e.message}`);
            }
        });
    }
    /**
     * Notifies an external IPFS node to pin the local files.
     * @param peerId The peerId of the local IPFS node.
     * @param coords An object containing the base X and Y coordinates for the parcel.
     */
    pinFiles(peerId, coords, ipfsHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const { x, y } = coords;
            const ipfsURL = yield this.getExternalURL();
            this.emit('ipfs:pin');
            try {
                const res = yield fetch(`${ipfsURL}/pin/${x}/${y}`, {
                    method: 'post',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        peerId,
                        ipfs: ipfsHash
                    })
                });
                if (res.status >= 400 && res.status < 600) {
                    const data = res.json ? yield res.json() : null;
                    throw new Error(data ? data.error : JSON.stringify(res));
                }
            }
            catch (e) {
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, 'Failed to pin files: ' + e.message);
            }
            this.emit('ipfs:pin-success');
        });
    }
    /**
     * Adds file to the local IPFS node.
     * @param files An array of objects containing the path and content for the files.
     * @param onProgress A callback function to be called for each file uploaded (receives the total amount of bytes uploaded as an agument).
     */
    addFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipfsFiles = files.map(file => {
                return { path: `/tmp/${file.path}`, content: file.content };
            });
            if (ipfsFiles.length === 0) {
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, 'Unable to upload files: no files available (check your .dclignore rules)');
            }
            this.emit('ipfs:add');
            try {
                const res = yield this.ipfsApi.files.add(ipfsFiles, {
                    recursive: true
                });
                this.emit('ipfs:add-success');
                return res;
            }
            catch (e) {
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, `Unable to connect to the IPFS daemon, make sure it is running: https://ipfs.io/docs/getting-started\n${e.message}`);
            }
        });
    }
    /**
     * Publishes the IPNS for the project based on its IPFS key.
     * @param projectId The uuid generated for the project.
     * @param ipfsHash The hash of the root directory to be published.
     */
    publish(projectId, ipfsHash) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit('ipfs:publish', ipfsHash);
            if (!ipfsHash) {
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, 'Failed to publish: missing IPFS hash');
            }
            try {
                const { name } = yield this.ipfsApi.name.publish(ipfsHash, { key: projectId });
                this.emit('ipfs:publish-success', name);
                return name;
            }
            catch (e) {
                if (e.message && typeof e.message === 'string') {
                    errors_1.fail(errors_1.ErrorType.IPFS_ERROR, `Failed to publish: ${e.message} (try restarting your IPFS daemon)`);
                }
                errors_1.fail(errors_1.ErrorType.IPFS_ERROR, `Failed to publish: ${e}`);
            }
        });
    }
    /**
     * Emit key-success event
     */
    genKeySuccess() {
        this.emit('ipfs:key-success');
    }
    resolveParcel(x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getExternalURL();
            const raw = yield fetch(url + `/resolve/${x}/${y}`);
            let response;
            try {
                response = (yield raw.json());
            }
            catch (e) {
                response = null;
            }
            return response;
        });
    }
    getDeployedFiles(x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.resolveParcel(x, y);
            return res && res.url && res.url.dependencies.length ? res.url.dependencies : [];
        });
    }
    getRemoteSceneMetadata(x, y) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = yield this.getExternalURL();
            const resolvedParcel = yield this.resolveParcel(x, y);
            if (resolvedParcel && resolvedParcel.url) {
                const raw = yield fetch(url + `/get/${resolvedParcel.url.ipfs}/scene.json`);
                const res = (yield raw.json());
                return res;
            }
            return null;
        });
    }
    /**
     * Fetches Decentraland's IPFS node URL.
     */
    getExternalURL() {
        return __awaiter(this, void 0, void 0, function* () {
            let ipfsURL = this.gateway;
            if (ipfsURL) {
                return ipfsURL;
            }
            try {
                const raw = yield fetch('https://decentraland.github.io/ipfs-node/url.json');
                const data = (yield raw.json());
                if (env_1.isDev) {
                    ipfsURL = data.staging;
                }
                else {
                    ipfsURL = data.production;
                }
            }
            catch (error) {
                // fallback to ENV
            }
            this.gateway = ipfsURL;
            return ipfsURL;
        });
    }
}
exports.IPFS = IPFS;
