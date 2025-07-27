var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
export function fetchPostsFromApi(_a) {
    return __awaiter(this, arguments, void 0, function* ({ source = "e621", tags = "", page = 1, orderBy = "score" }) {
        var _b;
        try {
            console.log('Sending request to API:', { source, tags, page, orderBy });
            const url = `/api/posts?source=${source}&tags=${encodeURIComponent(tags)}&page=${page}&order=${orderBy}`;
            const { data } = yield axios.get(url);
            console.log('Got response:', { count: data.length });
            return data;
        }
        catch (error) {
            console.error('API request failed:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response:', (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            }
            throw error;
        }
    });
}
