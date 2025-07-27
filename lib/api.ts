import axios from "axios";

export type PostSource = "e621" | "rule34" | "xbooru";

export interface ApiPost {
  id: number | string;
  source: PostSource;
  file_url: string;
  preview_url: string;
  sample_url: string;
  tags: string[];
  tagCategories?: {
    artist: string[];
    character: string[];
    copyright: string[];
    general: string[];
    meta: string[];
  };
  artists?: string[];
  rating: string;
  width: number;
  height: number;
  created_at: string;
  score: number;
  description: string;
}

interface FetchPostsOptions {
  source: PostSource;
  tags?: string;
  page?: number;
  orderBy?: string;
  filterBy?: string;
}

export async function fetchPostsFromApi({
  source = "e621",
  tags = "",
  page = 1,
  orderBy = "score",
  filterBy = "none"
}: FetchPostsOptions): Promise<ApiPost[]> {
  try {
    console.log('Sending request to API:', { source, tags, page, orderBy, filterBy });
    const url = `/api/posts?source=${source}&tags=${encodeURIComponent(tags)}&page=${page}&order=${orderBy}&filter=${filterBy}`;
    const { data } = await axios.get(url);
    console.log('Got response:', { count: data.length });
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
    }
    throw error;
  }
}
