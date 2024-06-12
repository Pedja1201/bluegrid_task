"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
const router = express_1.default.Router();
const cache = new node_cache_1.default({ stdTTL: 3600 }); // Cache for 1 hour
const EXTERNAL_API_URL = 'https://rest-test-eight.vercel.app/api/test';
const transformData = (data) => {
    const result = {};
    data.forEach(url => {
        const urlParts = url.split('/');
        const ip = urlParts[2].split(':')[0];
        const pathParts = urlParts.slice(3);
        if (!result[ip])
            result[ip] = [];
        let currentLevel = result[ip];
        pathParts.forEach((part, index) => {
            if (index === pathParts.length - 1) {
                // It's a file
                if (Array.isArray(currentLevel)) {
                    currentLevel.push(part);
                }
                else {
                    currentLevel.push(part);
                }
            }
            else {
                // It's a directory
                let dirObj = currentLevel.find((item) => typeof item === 'object' && item[part]);
                if (!dirObj) {
                    dirObj = { [part]: [] };
                    currentLevel.push(dirObj);
                }
                currentLevel = dirObj[part];
            }
        });
    });
    return result;
};
router.get('/files', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cachedData = cache.get('files');
        if (cachedData) {
            return res.json(cachedData);
        }
        const response = yield axios_1.default.get(EXTERNAL_API_URL);
        const transformedData = transformData(response.data);
        cache.set('files', transformedData);
        res.json(transformedData);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
}));
exports.default = router;
