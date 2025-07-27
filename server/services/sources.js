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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchE621Posts = fetchE621Posts;
exports.fetchRule34Posts = fetchRule34Posts;
exports.fetchE621TagSuggestions = fetchE621TagSuggestions;
exports.fetchRule34TagSuggestions = fetchRule34TagSuggestions;
exports.fetchXbooruTagSuggestions = fetchXbooruTagSuggestions;
exports.fetchXbooruPosts = fetchXbooruPosts;
var axios_1 = require("axios");
function fetchE621Posts(tags, page) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "https://e621.net/posts.json?tags=".concat(encodeURIComponent(tags), "&page=").concat(page);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.data || !Array.isArray(response.data.posts)) {
                        throw new Error('Invalid response format from e621');
                    }
                    return [2 /*return*/, Promise.all(response.data.posts.map(function (post) { return __awaiter(_this, void 0, void 0, function () {
                            var artists, tagsToCheck, _i, tagsToCheck_1, tag, artistRes, err_1;
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                            return __generator(this, function (_k) {
                                switch (_k.label) {
                                    case 0:
                                        artists = Array.isArray((_a = post.tags) === null || _a === void 0 ? void 0 : _a.artist) ? __spreadArray([], post.tags.artist, true) : [];
                                        console.log("[POST ".concat(post.id, "] Artists iniciales:"), artists);
                                        if (!(artists.length === 0 && Array.isArray((_b = post.tags) === null || _b === void 0 ? void 0 : _b.general))) return [3 /*break*/, 7];
                                        tagsToCheck = post.tags.general.slice(0, 3);
                                        console.log("[POST ".concat(post.id, "] Buscando artistas en tags:"), tagsToCheck);
                                        _i = 0, tagsToCheck_1 = tagsToCheck;
                                        _k.label = 1;
                                    case 1:
                                        if (!(_i < tagsToCheck_1.length)) return [3 /*break*/, 6];
                                        tag = tagsToCheck_1[_i];
                                        _k.label = 2;
                                    case 2:
                                        _k.trys.push([2, 4, , 5]);
                                        console.log("[POST ".concat(post.id, "] Verificando tag: ").concat(tag));
                                        return [4 /*yield*/, axios_1.default.get("https://e621.net/artists/".concat(encodeURIComponent(tag), ".json"), {
                                                headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' },
                                                timeout: 3000
                                            })];
                                    case 3:
                                        artistRes = _k.sent();
                                        if (artistRes.data && artistRes.data.is_active) {
                                            console.log("[POST ".concat(post.id, "] Artista encontrado: ").concat(artistRes.data.name));
                                            artists.push(artistRes.data.name);
                                        }
                                        return [3 /*break*/, 5];
                                    case 4:
                                        err_1 = _k.sent();
                                        console.log("[POST ".concat(post.id, "] Tag \"").concat(tag, "\" no es artista o error:"), ((_c = err_1.response) === null || _c === void 0 ? void 0 : _c.status) || err_1.message);
                                        return [3 /*break*/, 5];
                                    case 5:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 6:
                                        console.log("[POST ".concat(post.id, "] Artists finales:"), artists);
                                        _k.label = 7;
                                    case 7: return [2 /*return*/, {
                                            id: post.id,
                                            source: 'e621',
                                            file_url: ((_d = post.file) === null || _d === void 0 ? void 0 : _d.url) || '',
                                            preview_url: ((_e = post.preview) === null || _e === void 0 ? void 0 : _e.url) || '',
                                            sample_url: ((_f = post.sample) === null || _f === void 0 ? void 0 : _f.url) || '',
                                            tags: ((_g = post.tags) === null || _g === void 0 ? void 0 : _g.general) || [],
                                            artists: artists,
                                            rating: post.rating || 'unknown',
                                            width: ((_h = post.file) === null || _h === void 0 ? void 0 : _h.width) || 0,
                                            height: ((_j = post.file) === null || _j === void 0 ? void 0 : _j.height) || 0,
                                            created_at: post.created_at || new Date().toISOString(),
                                            score: post.score || 0,
                                            description: post.description || '',
                                        }];
                                }
                            });
                        }); })).then(function (posts) {
                            var _a;
                            var filteredPosts = posts.filter(function (post) { return post.file_url && post.preview_url; });
                            console.log("[E621] Enviando ".concat(filteredPosts.length, " posts al frontend"));
                            console.log("[E621] Ejemplo de post con artistas:", (_a = filteredPosts[0]) === null || _a === void 0 ? void 0 : _a.artists);
                            return filteredPosts;
                        })];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching e621 posts:', error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchRule34Posts(tags, page) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=".concat(encodeURIComponent(tags), "&pid=").concat(page);
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.map(function (post) { return ({
                            id: post.id,
                            source: 'rule34',
                            file_url: post.file_url,
                            preview_url: post.preview_url,
                            sample_url: post.sample_url,
                            tags: post.tags.split(' '),
                            artists: post.artist ? [post.artist] : [],
                            rating: post.rating,
                            width: post.width,
                            height: post.height,
                            created_at: post.created_at,
                            score: post.score,
                            description: '',
                        }); })];
            }
        });
    });
}
function fetchE621TagSuggestions(term) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "https://e621.net/tags.json?search[name_matches]=".concat(encodeURIComponent(term), "*&search[order]=count");
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.map(function (tag) { return tag.name; })];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error fetching e621 suggestions:', error_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchRule34TagSuggestions(term) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "https://api.rule34.xxx/autocomplete.php?q=".concat(encodeURIComponent(term));
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
                        })];
                case 1:
                    response = _a.sent();
                    // La API oficial retorna un array de objetos con la propiedad 'value'
                    return [2 /*return*/, response.data.map(function (item) { return item.value; })];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error fetching rule34 suggestions:', error_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchXbooruTagSuggestions(term) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "https://xbooru.com/autocomplete.php?q=".concat(encodeURIComponent(term));
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.map(function (item) { return item.value; })];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error fetching xbooru suggestions:', error_4);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchXbooruPosts(tags, page) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://xbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=".concat(encodeURIComponent(tags), "&pid=").concat(page);
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.map(function (post) { return ({
                            id: post.id,
                            source: 'xbooru',
                            file_url: post.file_url,
                            preview_url: post.preview_url,
                            sample_url: post.sample_url,
                            tags: post.tags.split(' '),
                            artists: post.artist ? [post.artist] : [],
                            rating: post.rating,
                            width: post.width,
                            height: post.height,
                            created_at: post.created_at,
                            score: post.score,
                            description: '',
                        }); })];
            }
        });
    });
}
