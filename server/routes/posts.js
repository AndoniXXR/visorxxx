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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
const express = require('express');
const { fetchE621Posts, fetchRule34Posts, fetchXbooruPosts, fetchE621TagSuggestions, fetchRule34TagSuggestions, fetchXbooruTagSuggestions } = require('../services/sources');
const router = express.Router();
// GET /api/posts?source=e621|rule34|xbooru&tags=tag1+tag2&page=1
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, source, _c, tags, _d, page, posts, _e, error_1;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = req.query, _b = _a.source, source = _b === void 0 ? 'e621' : _b, _c = _a.tags, tags = _c === void 0 ? '' : _c, _d = _a.page, page = _d === void 0 ? 1 : _d;
                console.log('Received request:', { source: source, tags: tags, page: page });
                _f.label = 1;
            case 1:
                _f.trys.push([1, 10, , 11]);
                posts = [];
                _e = source;
                switch (_e) {
                    case 'e621': return [3 /*break*/, 2];
                    case 'rule34': return [3 /*break*/, 4];
                    case 'xbooru': return [3 /*break*/, 6];
                }
                return [3 /*break*/, 8];
            case 2:
                console.log('Fetching from e621...');
                return [4 /*yield*/, (0, sources_1.fetchE621Posts)(tags, Number(page))];
            case 3:
                posts = _f.sent();
                return [3 /*break*/, 9];
            case 4:
                console.log('Fetching from rule34...');
                return [4 /*yield*/, (0, sources_1.fetchRule34Posts)(tags, Number(page))];
            case 5:
                posts = _f.sent();
                return [3 /*break*/, 9];
            case 6:
                console.log('Fetching from xbooru...');
                return [4 /*yield*/, (0, sources_1.fetchXbooruPosts)(tags, Number(page))];
            case 7:
                posts = _f.sent();
                return [3 /*break*/, 9];
            case 8:
                console.log('Invalid source:', source);
                return [2 /*return*/, res.status(400).json({ error: 'Invalid source' })];
            case 9:
                console.log("Got ".concat(posts.length, " posts"));
                res.json(posts);
                return [3 /*break*/, 11];
            case 10:
                error_1 = _f.sent();
                res.status(500).json({ error: 'Failed to fetch posts', details: error_1 });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
// GET /api/posts/suggestions?term=cat&source=e621
router.get('/suggestions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, term, _c, source, suggestions, _d, error_2;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = req.query, _b = _a.term, term = _b === void 0 ? '' : _b, _c = _a.source, source = _c === void 0 ? 'e621' : _c;
                console.log('Fetching suggestions:', { term: term, source: source });
                _e.label = 1;
            case 1:
                _e.trys.push([1, 10, , 11]);
                suggestions = [];
                _d = source;
                switch (_d) {
                    case 'e621': return [3 /*break*/, 2];
                    case 'rule34': return [3 /*break*/, 4];
                    case 'xbooru': return [3 /*break*/, 6];
                }
                return [3 /*break*/, 8];
            case 2: return [4 /*yield*/, (0, sources_1.fetchE621TagSuggestions)(term)];
            case 3:
                suggestions = _e.sent();
                return [3 /*break*/, 9];
            case 4: return [4 /*yield*/, (0, sources_1.fetchRule34TagSuggestions)(term)];
            case 5:
                suggestions = _e.sent();
                return [3 /*break*/, 9];
            case 6: return [4 /*yield*/, (0, sources_1.fetchXbooruTagSuggestions)(term)];
            case 7:
                suggestions = _e.sent();
                return [3 /*break*/, 9];
            case 8: return [2 /*return*/, res.status(400).json({ error: 'Invalid source' })];
            case 9:
                res.json(suggestions);
                return [3 /*break*/, 11];
            case 10:
                error_2 = _e.sent();
                res.status(500).json({ error: 'Failed to fetch suggestions', details: error_2 });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
