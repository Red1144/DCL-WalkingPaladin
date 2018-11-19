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
const http_1 = require("http");
const WebSocket = require("ws");
const express = require("express");
const project_1 = require("../utils/project");
const events_1 = require("events");
const fs = require("fs-extra");
const errors_1 = require("../utils/errors");
const chokidar = require("chokidar");
const ignore = require("ignore");
const portfinder = require("portfinder");
const bodyParser = require("body-parser");
const cors = require("cors");
function nocache(req, res, next) {
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
}
/**
 * Events emitted by this class:
 *
 * preview:ready - The server is up and running
 */
class Preview extends events_1.EventEmitter {
    constructor(ignoredPaths, watch) {
        super();
        this.app = express();
        this.server = http_1.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.ignoredPaths = ignoredPaths;
        this.watch = watch;
    }
    startServer(port) {
        return __awaiter(this, void 0, void 0, function* () {
            const root = project_1.getRootPath();
            const ig = ignore().add(this.ignoredPaths);
            let resolvedPort = port;
            if (!resolvedPort) {
                try {
                    resolvedPort = yield portfinder.getPortPromise();
                }
                catch (e) {
                    resolvedPort = 2044;
                }
            }
            if (this.watch) {
                chokidar.watch(root).on('all', (event, path) => {
                    if (!ig.ignores(path)) {
                        this.wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send('update');
                            }
                        });
                    }
                });
            }
            this.app.use(cors());
            const artifactPath = path.resolve('node_modules', 'decentraland-api');
            if (!fs.pathExistsSync(artifactPath)) {
                errors_1.fail(errors_1.ErrorType.PREVIEW_ERROR, `Couldn\'t find ${artifactPath}, please run: npm install decentraland-api@latest`);
            }
            this.app.get('/', (req, res) => {
                res.setHeader('Content-Type', 'text/html');
                res.sendFile(path.resolve(artifactPath, 'artifacts/preview.html'));
            });
            this.app.use('/@', express.static(artifactPath));
            this.app.use(express.static(root));
            this.app.use(nocache);
            setUpRendezvous(this.app);
            this.emit('preview:ready', resolvedPort);
            return new Promise((resolve, reject) => {
                this.server
                    .listen(resolvedPort)
                    .on('close', () => resolve())
                    .on('error', (e) => {
                    reject(e);
                });
            });
        });
    }
}
exports.Preview = Preview;
function setUpRendezvous(app) {
    /**
     * Store all connections in place
     */
    const connections = [];
    /**
     * This middleware sets up Server-Sent Events.
     */
    const sse = (req, res, next) => {
        const connection = {
            uuid: req.params.uuid,
            res: res
        };
        // SSE protocol works by setting the `content-type` to `event-stream`
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        });
        // Enrich the response object with the ability to send packets
        res.sseSend = data => {
            try {
                res.write('data: ' + JSON.stringify(data) + '\n\n');
            }
            catch (e) {
                connections.splice(connections.indexOf(connection), 1);
                clearInterval(res.interval);
            }
        };
        // Setup an interval to keep the connection alive
        res.interval = setInterval(() => {
            res.sseSend({
                type: 'ping'
            });
        }, 5000);
        // Store the connection
        connections.push(connection);
        next();
    };
    app.use(bodyParser.json());
    app.post('/signaling/announce', (req, res) => {
        const uuid = req.body.uuid;
        const packet = {
            type: 'announce',
            uuid: uuid
        };
        connections.forEach(c => {
            // Don't announce to self
            if (c.uuid !== uuid) {
                c.res.sseSend(packet);
            }
        });
        res.sendStatus(200);
    });
    app.post('/signaling/:uuid/signal', (req, res) => {
        const uuid = req.params.uuid;
        const packet = {
            type: 'signal',
            initiator: req.body.initiator,
            data: req.body.data,
            uuid: req.body.uuid
        };
        let result = false;
        connections.forEach(c => {
            if (c.uuid === uuid) {
                c.res.sseSend(packet);
                result = true;
            }
        });
        res.sendStatus(result ? 200 : 404);
    });
    app.get('/signaling/:uuid/listen', sse, (_, res) => {
        // tslint:disable-next-line:semicolon
        ;
        res.sseSend({
            type: 'accept'
        });
    });
}
