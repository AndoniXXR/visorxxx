import { Router, Request, Response } from 'express';
import { 
  fetchE621Posts, fetchRule34Posts, fetchXbooruPosts,
  fetchE621TagSuggestions, fetchRule34TagSuggestions, fetchXbooruTagSuggestions
} from '../services/sources';

const router = Router();

// GET /api/posts?source=e621|rule34|xbooru&tags=tag1+tag2&page=1
router.get('/', async (req: Request, res: Response) => {
  const { source = 'e621', tags = '', page = 1 } = req.query as { source?: string; tags?: string; page?: number };
  console.log('Received request:', { source, tags, page });
  try {
    let posts = [];
    switch (source) {
      case 'e621':
        console.log('Fetching from e621...');
        posts = await fetchE621Posts(tags as string, Number(page));
        break;
      case 'rule34':
        console.log('Fetching from rule34...');
        posts = await fetchRule34Posts(tags as string, Number(page));
        break;
      case 'xbooru':
        console.log('Fetching from xbooru...');
        posts = await fetchXbooruPosts(tags as string, Number(page));
        break;
      default:
        console.log('Invalid source:', source);
        return res.status(400).json({ error: 'Invalid source' });
    }
    console.log(`Got ${posts.length} posts`);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts', details: error });
  }
});

// GET /api/posts/suggestions?term=cat&source=e621
router.get('/suggestions', async (req: Request, res: Response) => {
  const { term = '', source = 'e621' } = req.query as { term?: string; source?: string };
  console.log('Fetching suggestions:', { term, source });

  try {
    let suggestions = [];
    switch (source) {
      case 'e621':
        suggestions = await fetchE621TagSuggestions(term as string);
        break;
      case 'rule34':
        suggestions = await fetchRule34TagSuggestions(term as string);
        break;
      case 'xbooru':
        suggestions = await fetchXbooruTagSuggestions(term as string);
        break;
      default:
        return res.status(400).json({ error: 'Invalid source' });
    }
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suggestions', details: error });
  }
});

export default router;
