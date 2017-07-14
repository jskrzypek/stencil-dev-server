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
const url = require("url");
const fs = require("fs");
const promisify_1 = require("./promisify");
exports.fsStatPr = promisify_1.promisify(fs.stat);
exports.fsReadFilePr = promisify_1.promisify(fs.readFile);
exports.fsReadDirPr = promisify_1.promisify(fs.readdir);
function findClosestOpenPort(host, port) {
    return __awaiter(this, void 0, void 0, function* () {
        function t(portToCheck) {
            return __awaiter(this, void 0, void 0, function* () {
                const isTaken = yield isPortTaken(host, portToCheck);
                if (!isTaken) {
                    return portToCheck;
                }
                return t(portToCheck + 1);
            });
        }
        return t(port);
    });
}
exports.findClosestOpenPort = findClosestOpenPort;
function isPortTaken(host, port) {
    return new Promise((resolve, reject) => {
        var net = require('net');
        var tester = net.createServer()
            .once('error', function (err) {
            if (err.code !== 'EADDRINUSE') {
                return resolve(true);
            }
            resolve(true);
        })
            .once('listening', function () {
            tester.once('close', function () {
                resolve(false);
            })
                .close();
        })
            .on('error', (err) => {
            reject(err);
        })
            .listen(port, host);
    });
}
exports.isPortTaken = isPortTaken;
function parseOptions(optionInfo, argv) {
    return Object.keys(optionInfo).reduce((options, key) => {
        let foundIndex = argv.indexOf(`--${key}`);
        if (foundIndex === -1) {
            options[key] = optionInfo[key].default;
            return options;
        }
        switch (optionInfo[key].type) {
            case Boolean:
                options[key] = true;
                break;
            case Number:
                options[key] = parseInt(argv[foundIndex + 1], 10);
                break;
            default:
                options[key] = argv[foundIndex + 1];
        }
        return options;
    }, {});
}
exports.parseOptions = parseOptions;
function parseConfigFile(baseDir, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = {};
        try {
            const configFile = yield Promise.resolve().then(function () { return require(path.resolve(baseDir, filePath)); });
            config = configFile.devServer || {};
        }
        catch (err) {
            if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                console.log(`The specified configFile does not exist: ${filePath}`);
            }
            if (err.code === 'EACCES') {
                console.log(`You do not have permission to read the specified configFile: ${filePath}`);
            }
        }
        return config;
    });
}
exports.parseConfigFile = parseConfigFile;
function getRequestedPath(requestUrl) {
    const parsed = url.parse(requestUrl);
    decodeURIComponent(requestUrl);
    return decodePathname(parsed.pathname || '');
}
exports.getRequestedPath = getRequestedPath;
function getFileFromPath(wwwRoot, requestUrl) {
    const pathname = getRequestedPath(requestUrl);
    return path.normalize(path.join(wwwRoot, path.relative('/', pathname)));
}
exports.getFileFromPath = getFileFromPath;
function decodePathname(pathname) {
    const pieces = pathname.replace(/\\/g, "/").split('/');
    return pieces.map((piece) => {
        piece = decodeURIComponent(piece);
        if (process.platform === 'win32' && /\\/.test(piece)) {
            throw new Error('Invalid forward slash character');
        }
        return piece;
    }).join('/');
}
