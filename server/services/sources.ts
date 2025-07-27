import axios from 'axios';

export async function fetchE621Posts(tags: string, page: number) {
  try {
    const url = `https://e621.net/posts.json?tags=${encodeURIComponent(tags)}&page=${page}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
    });
    
    if (!response.data || !Array.isArray(response.data.posts)) {
      throw new Error('Invalid response format from e621');
    }

    return Promise.all(response.data.posts.map(async (post: any) => {
      let artists = Array.isArray(post.tags?.artist) ? [...post.tags.artist] : [];
      console.log(`[POST ${post.id}] Artists iniciales:`, artists);
      
      // Si no hay artistas, buscar en tags.general (limitado a 3 tags para evitar rate limiting)
      if (artists.length === 0 && Array.isArray(post.tags?.general)) {
        const tagsToCheck = post.tags.general.slice(0, 3);
        console.log(`[POST ${post.id}] Buscando artistas en tags:`, tagsToCheck);
        
        for (const tag of tagsToCheck) {
          try {
            console.log(`[POST ${post.id}] Verificando tag: ${tag}`);
            const artistRes = await axios.get(`https://e621.net/artists/${encodeURIComponent(tag)}.json`, {
              headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' },
              timeout: 3000
            });
            
            if (artistRes.data && artistRes.data.is_active) {
              console.log(`[POST ${post.id}] Artista encontrado: ${artistRes.data.name}`);
              artists.push(artistRes.data.name);
            }
          } catch (err) {
            console.log(`[POST ${post.id}] Tag "${tag}" no es artista o error:`, err.response?.status || err.message);
          }
        }
        console.log(`[POST ${post.id}] Artists finales:`, artists);
      }
      return {
        id: post.id,
        source: 'e621',
        file_url: post.file?.url || '',
        preview_url: post.preview?.url || '',
        sample_url: post.sample?.url || '',
        tags: post.tags?.general || [],
        artists: artists,
        rating: post.rating || 'unknown',
        width: post.file?.width || 0,
        height: post.file?.height || 0,
        created_at: post.created_at || new Date().toISOString(),
        score: post.score || 0,
        description: post.description || '',
      };
    })).then(posts => {
      const filteredPosts = posts.filter((post: any) => post.file_url && post.preview_url);
      console.log(`[E621] Enviando ${filteredPosts.length} posts al frontend`);
      console.log(`[E621] Ejemplo de post con artistas:`, filteredPosts[0]?.artists);
      return filteredPosts;
    });
  } catch (error) {
    console.error('Error fetching e621 posts:', error);
    return [];
  }
}

export async function fetchRule34Posts(tags: string, page: number) {
  const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tags)}&pid=${page}`;
  const response = await axios.get(url);
  return response.data.map((post: any) => ({
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
  }));
}

export async function fetchE621TagSuggestions(term: string): Promise<string[]> {
  try {
    const url = `https://e621.net/tags.json?search[name_matches]=${encodeURIComponent(term)}*&search[order]=count`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
    });
    
    return response.data.map((tag: any) => tag.name);
  } catch (error) {
    console.error('Error fetching e621 suggestions:', error);
    return [];
  }
}

export async function fetchRule34TagSuggestions(term: string): Promise<string[]> {
  try {
    const url = `https://api.rule34.xxx/autocomplete.php?q=${encodeURIComponent(term)}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'dark-post-viewer/1.0 (by anonymous)' }
    });
    // La API oficial retorna un array de objetos con la propiedad 'value'
    return response.data.map((item: any) => item.value);
  } catch (error) {
    console.error('Error fetching rule34 suggestions:', error);
    return [];
  }
}

export async function fetchXbooruTagSuggestions(term: string): Promise<string[]> {
  try {
    const url = `https://xbooru.com/autocomplete.php?q=${encodeURIComponent(term)}`;
    const response = await axios.get(url);
    return response.data.map((item: any) => item.value);
  } catch (error) {
    console.error('Error fetching xbooru suggestions:', error);
    return [];
  }
}

export async function fetchXbooruPosts(tags: string, page: number) {
  const url = `https://xbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=${encodeURIComponent(tags)}&pid=${page}`;
  const response = await axios.get(url);
  return response.data.map((post: any) => ({
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
  }));
}
