'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, X, ImageIcon, FileImage, Tag, User, Calendar, TrendingUp, 
  Shuffle, Clock, Copy, Download, ChevronLeft, ChevronRight, ChevronUp, 
  Plus, Minus, History, ChevronFirst, ChevronLast, RefreshCw, Settings
} from "lucide-react";
import { VideoPlayer } from "@/app/components/video-player";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { fetchPostsFromApi, ApiPost, PostSource } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggleButton } from "./ThemeToggleButton";

// Constants
const SOURCES: { label: string; value: PostSource }[] = [
  { label: "e621", value: "e621" },
  { label: "Rule34", value: "rule34" },
  { label: "Xbooru", value: "xbooru" },
];

// Utility functions
function getPostType(post: ApiPost): "image" | "video" | "gif" {
  if (!post.file_url || typeof post.file_url !== "string") return "image";
  const ext = post.file_url.split('.').pop()?.toLowerCase();
  if (!ext) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  if (["gif"].includes(ext)) return "gif";
  return "image";
}

// Copy to clipboard function
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function Home() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSource, setSelectedSource] = useState<PostSource>("e621");
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<string>("date");
  const [filterBy, setFilterBy] = useState<string>("none");
  const [hasInitialSearch, setHasInitialSearch] = useState(true);
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [showArtistCopyMessage, setShowArtistCopyMessage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCancelled, setDownloadCancelled] = useState(false);
  const [searchHistory, setSearchHistory] = useState<{terms: string[], source: PostSource, timestamp: number}[]>([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const [navigationMessage, setNavigationMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextPost, setNextPost] = useState<ApiPost | null>(null);

  // Refs para debounce de navegación
  const lastKeyPressTime = useRef(0);
  const keyPressDelay = 150; // 150ms entre pulsaciones

  const search = useCallback(async () => {
    if (!loading) {
      setLoading(true);
      setError(null);
      console.log('Starting search:', { searchTerms, selectedSource, currentPage, orderBy, filterBy });
      try {
        const posts = await fetchPostsFromApi({
          tags: searchTerms.join(" "),
          source: selectedSource,
          page: currentPage,
          orderBy,
          filterBy,
        });
        // Si la respuesta es un objeto con posts, usa posts.posts
        let postsArray = Array.isArray(posts) ? posts : (Array.isArray(posts?.posts) ? posts.posts : []);
        console.log('Got posts:', { count: postsArray?.length });
        if (!postsArray || postsArray.length === 0) {
          setError(t('noResults'));
          setPosts([]);
        } else {
          setError(null);
          setPosts(postsArray);
          // Add to search history if there are search terms
          if (searchTerms.length > 0) {
            const newEntry = {
              terms: [...searchTerms],
              source: selectedSource,
              timestamp: Date.now()
            };
            setSearchHistory(prev => {
              // Remove duplicates and keep only last 10 searches
              const filtered = prev.filter(entry => 
                !(JSON.stringify(entry.terms) === JSON.stringify(newEntry.terms) && 
                  entry.source === newEntry.source)
              );
              return [newEntry, ...filtered].slice(0, 10);
            });
          }
        }
      } catch (error) {
        console.error('Search failed:', error);
        if (error instanceof Error) {
          setError(`${t('error')}: ${error.message}`);
        } else {
          setError(t('error'));
        }
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
  }, [searchTerms, selectedSource, currentPage, orderBy, loading]);

  // Refresh function to reload current posts
  const refreshPosts = useCallback(async () => {
    if (!refreshing && hasInitialSearch) {
      setRefreshing(true);
      setError(null);
      console.log('Refreshing posts:', { searchTerms, selectedSource, currentPage, orderBy, filterBy });
      try {
        const posts = await fetchPostsFromApi({
          tags: searchTerms.join(" "),
          source: selectedSource,
          page: currentPage,
          orderBy,
          filterBy,
        });
        console.log('Refreshed posts:', { count: posts?.length });
        if (!posts || posts.length === 0) {
          setError(t('noResults'));
          setPosts([]);
        } else {
          setError(null);
          setPosts(posts);
          // Show success message briefly
          setNavigationMessage(t('refreshed'));
          setTimeout(() => setNavigationMessage(null), 2000);
        }
      } catch (error) {
        console.error('Refresh failed:', error);
        if (error instanceof Error) {
          setError(`${t('error')}: ${error.message}`);
        } else {
          setError(t('error'));
        }
      } finally {
        setRefreshing(false);
      }
    }
  }, [searchTerms, selectedSource, currentPage, orderBy, filterBy, refreshing, hasInitialSearch, t]);

  useEffect(() => {
    if (hasInitialSearch) {
      search();
    }
  }, [hasInitialSearch, searchTerms, selectedSource, currentPage, orderBy, filterBy]);

  // Efecto para obtener sugerencias
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchValue.trim().length === 0) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/posts/suggestions?term=${searchValue}&source=${selectedSource}`);
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchValue, selectedSource]);

  const addSearchTerm = (tag: string) => {
    if (!searchTerms.includes(tag)) {
      setSearchTerms([...searchTerms, tag]);
    }
    setSearchValue("");
  };

  const removeSearchTerm = (tag: string) => {
    setSearchTerms(searchTerms.filter((t) => t !== tag));
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      addSearchTerm(searchValue.trim());
      if (!hasInitialSearch) {
        setHasInitialSearch(true);
      }
    }
  };

  const handleNewPage = (direction: "prev" | "next") => {
    const newPage = direction === "prev" ? currentPage - 1 : currentPage + 1;
    setCurrentPage(Math.max(1, newPage));
  };

  const handleOrderByChange = (order: string) => {
    if (order !== orderBy) {
      setOrderBy(order);
      setCurrentPage(1);
    }
  };

  const newSearchWithTag = (tag: string) => {
    if (!searchTerms.includes(tag)) {
      setSearchTerms([...searchTerms, tag]);
      setCurrentPage(1);
    }
  };

  const loadSearchFromHistory = (historyEntry: {terms: string[], source: PostSource, timestamp: number}) => {
    setSearchTerms(historyEntry.terms);
    setSelectedSource(historyEntry.source);
    setCurrentPage(1);
    if (!hasInitialSearch) {
      setHasInitialSearch(true);
    }
  };

  // Show navigation message
  const showNavigationMessage = (message: string) => {
    setNavigationMessage(message);
    setTimeout(() => setNavigationMessage(null), 2000);
  };

  // Navigation functions for post viewer with smooth transitions
  const navigateToPost = useCallback(async (direction: 'prev' | 'next') => {
    if (!selectedPost || posts.length === 0 || isTransitioning) return;

    setIsTransitioning(true);
    let newIndex = currentPostIndex;
    let newPage = currentPage;
    let newPosts = posts;

    if (direction === 'next') {
      if (currentPostIndex < posts.length - 1) {
        newIndex = currentPostIndex + 1;
      } else {
        // Need to go to next page
        try {
          const nextPagePosts = await fetchPostsFromApi({
            tags: searchTerms.join(" "),
            source: selectedSource,
            page: currentPage + 1,
            orderBy,
            filterBy,
          });
          
          if (nextPagePosts && nextPagePosts.length > 0) {
            newPage = currentPage + 1;
            newPosts = nextPagePosts;
            newIndex = 0;
            setPosts(nextPagePosts);
            setCurrentPage(newPage);
            showNavigationMessage(t('jumpedToNextPage'));
          } else {
            showNavigationMessage(t('noMorePosts'));
            setIsTransitioning(false);
            return;
          }
        } catch (error) {
          showNavigationMessage(t('errorLoadingNextPage'));
          setIsTransitioning(false);
          return;
        }
      }
    } else {
      if (currentPostIndex > 0) {
        newIndex = currentPostIndex - 1;
      } else {
        if (currentPage > 1) {
          // Need to go to previous page
          try {
            const prevPagePosts = await fetchPostsFromApi({
              tags: searchTerms.join(" "),
              source: selectedSource,
              page: currentPage - 1,
              orderBy,
              filterBy,
            });
            
            if (prevPagePosts && prevPagePosts.length > 0) {
              newPage = currentPage - 1;
              newPosts = prevPagePosts;
              newIndex = prevPagePosts.length - 1;
              setPosts(prevPagePosts);
              setCurrentPage(newPage);
              showNavigationMessage(t('jumpedToPrevPage'));
            } else {
              showNavigationMessage(t('errorLoadingPrevPage'));
              setIsTransitioning(false);
              return;
            }
          } catch (error) {
            showNavigationMessage(t('errorLoadingPrevPage'));
            setIsTransitioning(false);
            return;
          }
        } else {
          showNavigationMessage(t('noPreviousPosts'));
          setIsTransitioning(false);
          return;
        }
      }
    }

    // Smooth transition
    setCurrentPostIndex(newIndex);
    setNextPost(newPosts[newIndex]);
    
    // Small delay for smooth transition
    setTimeout(() => {
      setSelectedPost(newPosts[newIndex]);
      setNextPost(null);
      setIsTransitioning(false);
    }, 100);
  }, [selectedPost, posts, currentPostIndex, currentPage, searchTerms, selectedSource, orderBy, isTransitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedPost || isTransitioning) return;
      
      // Debounce para evitar múltiples pulsaciones rápidas
      const currentTime = Date.now();
      if (currentTime - lastKeyPressTime.current < keyPressDelay) {
        e.preventDefault();
        return;
      }
      lastKeyPressTime.current = currentTime;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToPost('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToPost('next');  
      } else if (e.key === 'Escape') {
        setSelectedPost(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPost, navigateToPost, isTransitioning]);

  // Handle page input
  const handlePageInputSubmit = () => {
    const pageNum = parseInt(pageInput);
    if (pageNum && pageNum > 0 && pageNum <= 1000) {
      setCurrentPage(pageNum);
      setPageInput("");
    } else {
      showNavigationMessage(t('invalidPage'));
    }
  };

  // Handle post selection with index tracking
  const handlePostSelect = (post: ApiPost, index: number) => {
    setSelectedPost(post);
    setCurrentPostIndex(index);
  };

  // Fetch posts from the new API route
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="flex flex-col items-stretch min-h-screen w-full max-w-7xl mx-auto p-4 relative">
      {/* Theme Toggle Button en la esquina superior derecha, solo si no hay post seleccionado */}
      {!selectedPost && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000 }}>
          <ThemeToggleButton />
        </div>
      )}
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <LanguageSelector />
        </div>
      </div>

      {/* Navigation Message */}
      {navigationMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          {navigationMessage}
        </div>
      )}


      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="w-full flex flex-col gap-4 mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-1 relative min-w-0">
            <div className="relative w-full">
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="bg-background text-sm sm:text-base pr-16"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={refreshPosts}
                  disabled={refreshing}
                  className="p-1 hover:text-purple-400 disabled:opacity-50"
                  title="Recargar posts"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="p-1 hover:text-purple-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Sugerencias */}
              {searchValue && (
                <Card className="absolute w-full mt-1 z-50 max-h-60">
                  <Command>
                    <CommandInput 
                      value={searchValue}
                      onValueChange={setSearchValue}
                      placeholder={t('searchPlaceholder')}
                    />
                    <CommandList className="max-h-48 overflow-y-auto">
                      <CommandGroup>
                        {loadingSuggestions ? (
                          <div className="px-4 py-2 text-sm text-muted-foreground">Buscando...</div>
                        ) : (Array.isArray(suggestions) && suggestions.length === 0 ? (
                          <div className="px-4 py-2 text-sm text-muted-foreground">No hay coincidencias</div>
                        ) : (
                          (Array.isArray(suggestions) ? suggestions : []).map((tag) => (
                            <CommandItem
                              key={tag}
                              value={tag}
                              onSelect={() => {
                                addSearchTerm(tag);
                              }}
                              className="cursor-pointer"
                            >
                              <Tag className="w-4 h-4 mr-2" />
                              {tag}
                            </CommandItem>
                          ))
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </Card>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[140px] justify-between hover:bg-purple-500/20"
              >
                <span>{SOURCES.find((s) => s.value === selectedSource)?.label}</span>
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              <DropdownMenuLabel>{t('source')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedSource}
                onValueChange={(value) => setSelectedSource(value as PostSource)}
              >
                {SOURCES.map((source) => (
                  <DropdownMenuRadioItem key={source.value} value={source.value}>
                    {source.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[140px] justify-between hover:bg-purple-500/20"
              >
                <span>
                  {orderBy === "score"
                    ? t('orderScore')
                    : orderBy === "date"
                    ? t('orderDate')
                    : orderBy === "random"
                    ? t('orderRandom')
                    : ""}
                </span>
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              <DropdownMenuLabel>{t('orderBy')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={orderBy} onValueChange={handleOrderByChange}>
                <DropdownMenuRadioItem value="score">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t('orderScore')}
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {t('orderDate')}
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="random">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    {t('orderRandom')}
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[80px] sm:min-w-[120px] justify-between hover:bg-purple-500/20 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {t('filter')}
                </div>
                <ChevronUp className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[180px]">
              <DropdownMenuLabel>{t('filter')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filterBy} onValueChange={setFilterBy}>
                <DropdownMenuRadioItem value="none">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {t('none')}
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popularToday">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {t('popularToday')}
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popularByPage">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    {t('popularByPage')}
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="popularAllTime">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('popularAllTime')}
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[80px] sm:min-w-[120px] justify-between hover:bg-purple-500/20 text-xs sm:text-sm"
                disabled={searchHistory.length === 0}
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  {t('searchHistory')}
                </div>
                <ChevronUp className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[300px] max-h-[400px] overflow-y-auto">
              <DropdownMenuLabel>{t('searchHistory')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {searchHistory.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  {t('noRecentSearches')}
                </div>
              ) : (
                searchHistory.map((entry, index) => (
                  <DropdownMenuItem
                    key={`${entry.timestamp}-${index}`}
                    onClick={() => loadSearchFromHistory(entry)}
                    className="cursor-pointer flex flex-col items-start gap-1 p-3 hover:bg-purple-500/20"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex flex-wrap gap-1">
                        {entry.terms.slice(0, 3).map((term, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                        {entry.terms.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{entry.terms.length - 3} {t('more')}
                          </span>
                        )}
                      </div>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {entry.source}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="submit"
            onClick={handleSearchSubmit}
            disabled={!searchValue.trim()}
            className="w-full sm:w-auto hover:bg-purple-500"
          >
            <Search className="w-4 h-4 mr-2" />
            {t('search')}
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {searchTerms.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="group cursor-pointer hover:bg-purple-500/20"
              onClick={() => removeSearchTerm(tag)}
            >
              <span>{tag}</span>
              <X className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
            </Badge>
          ))}
        </div>
      </form>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
            <span className="text-muted-foreground">Cargando...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center justify-center min-h-[400px] text-center text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {posts.map((post, index) => (
              <Card 
                key={post.id} 
                className="overflow-hidden group relative cursor-pointer"
                onClick={() => handlePostSelect(post, index)}
              >
                <div className="aspect-square bg-purple-950/20">
                  <img
                    src={post.preview_url}
                    alt={post.tags.join(", ")}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      // Try fallback to sample_url or file_url if preview fails
                      if (img.src === post.preview_url && post.sample_url) {
                        img.src = post.sample_url;
                      } else if (img.src === post.sample_url && post.file_url) {
                        img.src = post.file_url;
                      } else {
                        // If all URLs fail, show a placeholder
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent && !parent.querySelector('.image-error-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'image-error-placeholder w-full h-full flex flex-col items-center justify-center text-center p-4';
                          
                          // Create icon element safely
                          const iconDiv = document.createElement('div');
                          iconDiv.className = 'text-gray-400 mb-2';
                          iconDiv.innerHTML = `
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 19 20.1 19 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                            </svg>
                          `;
                          
                          // Create text elements safely
                          const messageDiv = document.createElement('div');
                          messageDiv.className = 'text-xs text-gray-500 mb-1';
                          messageDiv.textContent = 'Imagen no disponible';
                          
                          const idDiv = document.createElement('div');
                          idDiv.className = 'text-xs text-gray-600';
                          idDiv.textContent = `${post.source} - ID: ${post.id}`;
                          
                          placeholder.appendChild(iconDiv);
                          placeholder.appendChild(messageDiv);
                          placeholder.appendChild(idDiv);
                          parent.appendChild(placeholder);
                        }
                      }
                    }}
                  />
                  {getPostType(post) === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="bg-white/90 rounded-full p-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="black"/>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hover:bg-purple-500/20"
                title="Primera página"
              >
                <ChevronFirst className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleNewPage("prev")}
                disabled={currentPage === 1}
                className="hover:bg-purple-500/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Página</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePageInputSubmit();
                    }
                  }}
                  placeholder={currentPage.toString()}
                  className="w-16 h-8 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePageInputSubmit}
                  className="h-8 px-2"
                >
                  Ir
                </Button>
              </div>
              <span className="text-lg font-medium text-purple-400">{currentPage}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleNewPage("next")}
                disabled={posts.length === 0}
                className="hover:bg-purple-500/20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1000)}
                disabled={posts.length === 0}
                className="hover:bg-purple-500/20"
                title="Última página disponible"
              >
                <ChevronLast className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Post Details */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent className="max-w-[98%] sm:max-w-3xl h-[95vh] sm:h-[90vh] p-2 sm:p-4 overflow-auto">
          {selectedPost && (
            <>
              {(() => {
                console.log('[POST ARTISTS]', selectedPost.artists);
                return null;
              })()}
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                {getPostType(selectedPost) === "video" ? t('video') : t('image')}
                {isTransitioning && (
                  <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                )}
              </DialogTitle>
              <DialogDescription>
                {/* Descripción eliminada por solicitud del usuario */}
              </DialogDescription>
              <div className="flex flex-col gap-3 h-full">
                <div className="flex-1 min-h-0 relative">
                  {/* Navigation buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white disabled:opacity-50"
                    onClick={() => navigateToPost('prev')}
                    disabled={isTransitioning}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white disabled:opacity-50"
                    onClick={() => navigateToPost('next')}
                    disabled={isTransitioning}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                  
                  {/* Post preview with touch navigation */}
                  {getPostType(selectedPost) === "video" ? (
                    <div 
                      key={selectedPost.id}
                      className={`w-full h-full max-h-[60vh] bg-purple-950/20 rounded-lg overflow-hidden relative transition-smooth ${
                        isTransitioning ? 'animate-fade-out' : 'animate-fade-in'
                      }`}
                      onTouchStart={(e) => {
                        if (isTransitioning) return;
                        const touch = e.touches[0];
                        (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
                      }}
                      onTouchEnd={(e) => {
                        if (isTransitioning) return;
                        const startX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
                        const endX = e.changedTouches[0].clientX;
                        const diff = startX - endX;
                        
                        if (Math.abs(diff) > 50) { // Minimum swipe distance
                          if (diff > 0) {
                            navigateToPost('next');
                          } else {
                            navigateToPost('prev');
                          }
                        }
                      }}
                    >
                      <VideoPlayer
                        src={selectedPost.file_url}
                        poster={selectedPost.preview_url}
                      />
                    </div>
                  ) : (
                    <div 
                      key={selectedPost.id}
                      className={`w-full h-full max-h-[60vh] bg-purple-950/20 rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer transition-smooth ${
                        isTransitioning ? 'animate-fade-out' : 'animate-fade-in'
                      }`}
                      onTouchStart={(e) => {
                        if (isTransitioning) return;
                        const touch = e.touches[0];
                        (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
                      }}
                      onTouchEnd={(e) => {
                        if (isTransitioning) return;
                        const startX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
                        const endX = e.changedTouches[0].clientX;
                        const diff = startX - endX;
                        
                        if (Math.abs(diff) > 50) { // Minimum swipe distance
                          if (diff > 0) {
                            navigateToPost('next');
                          } else {
                            navigateToPost('prev');
                          }
                        }
                      }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const width = rect.width;
                        
                        if (clickX < width / 2) {
                          navigateToPost('prev');
                        } else {
                          navigateToPost('next');
                        }
                      }}
                    >
                      <img
                        src={selectedPost.file_url}
                        alt={selectedPost.tags.join(", ")}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 relative">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-purple-500/20"
                    onClick={async () => {
                      if (!selectedPost) return;
                      let postUrl = '';
                      if (selectedPost.source === 'e621') {
                        postUrl = `https://e621.net/posts/${selectedPost.id}`;
                      } else if (selectedPost.source === 'rule34') {
                        postUrl = `https://rule34.xxx/index.php?page=post&s=view&id=${selectedPost.id}`;
                      } else if (selectedPost.source === 'xbooru') {
                        postUrl = `https://xbooru.com/index.php?page=post&s=view&id=${selectedPost.id}`;
                      }
                      try {
                        await navigator.clipboard.writeText(postUrl);
                        setShowCopyMessage(true);
                        setTimeout(() => setShowCopyMessage(false), 1200);
                      } catch (err) {
                        alert(t('couldNotCopyUrl'));
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('copyUrl')}
                  </Button>
                  {showCopyMessage && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-purple-700 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
                      {t('urlCopied')}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className={`flex-1 hover:bg-purple-500/20 relative ${isDownloading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={isDownloading}
                    onClick={async () => {
                      if (!selectedPost?.file_url) return;
                      setIsDownloading(true);
                      setDownloadCancelled(false);
                      let ext = 'file';
                      if (selectedPost.file_url.includes('.')) {
                        ext = selectedPost.file_url.split('.').pop()?.split('?')[0] || 'file';
                      }
                      const filename = `post_${selectedPost.id}.${ext}`;
                      let cancelled = false;
                      try {
                        const controller = new AbortController();
                        // Descargar usando el endpoint backend para evitar CSP
                        const responsePromise = fetch(`/api/download?url=${encodeURIComponent(selectedPost.file_url)}`, { signal: controller.signal });
                        // Si el usuario cierra la ventana de descarga, cancelar
                        const timeout = setTimeout(() => {
                          if (!isDownloading) return;
                          controller.abort();
                          cancelled = true;
                          setDownloadCancelled(true);
                          setIsDownloading(false);
                        }, 30000); // 30s máximo
                        const response = await responsePromise;
                        clearTimeout(timeout);
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        setIsDownloading(false);
                      } catch (error) {
                        setIsDownloading(false);
                        if (cancelled || (error && error.name === 'AbortError')) {
                          setDownloadCancelled(true);
                        } else {
                          console.error('Download failed:', error);
                          alert('Error al descargar el archivo');
                        }
                      }
                    }}
                  >
                    {isDownloading ? (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Download className="w-4 h-4 animate-spin text-purple-700" />
                      </span>
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isDownloading ? t('downloading') : t('download')}
                  </Button>
                  {downloadCancelled && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out text-sm">
                      Download cancelled
                    </div>
                  )}
                </div>

                {/* Artist section */}
                <div className="relative">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('artists')}
                    {selectedPost.artists && selectedPost.artists.length > 0 && (
                      <>
                        <span className="ml-2 text-purple-700 font-normal">
                          {selectedPost.artists.join(', ')}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2 hover:bg-purple-500/20"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(selectedPost.artists?.join(', ') || '');
                              setShowArtistCopyMessage(true);
                              setTimeout(() => setShowArtistCopyMessage(false), 1200);
                            } catch (err) {
                              alert(t('couldNotCopyArtist'));
                            }
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </h3>
                  {showArtistCopyMessage && (
                    <div className="absolute left-0 -top-10 bg-purple-700 text-white px-3 py-1 rounded shadow-lg z-50 animate-fade-in-out text-sm">
                      Artista copiado al portapapeles
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.artists?.map((artist: string) => (
                      <DropdownMenu key={artist}>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-purple-500/20"
                          >
                            {artist}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            newSearchWithTag(artist);
                            setSelectedPost(null);
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('addToSearch')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            removeSearchTerm(artist);
                          }}>
                            <Minus className="w-4 h-4 mr-2" />
                            {t('removeFromSearch')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSearchTerms([artist]);
                            setCurrentPage(1);
                            setSelectedPost(null);
                          }}>
                            <Search className="w-4 h-4 mr-2" />
                            {t('newSearchWithTag')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            copyToClipboard(artist);
                          }}>
                            <Copy className="w-4 h-4 mr-2" />
                            {t('copy')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ))}
                    {(!selectedPost.artists || selectedPost.artists.length === 0) && (
                      <span className="text-muted-foreground text-sm">{t('unknownArtist')}</span>
                    )}
                  </div>
                </div>

                {/* Tags section */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    {t('tags')}
                  </h3>
                  
                  {selectedPost.tagCategories ? (
                    <div className="space-y-4">
                      {/* Character tags */}
                      {selectedPost.tagCategories.character.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2 text-green-400">{t('characters')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.tagCategories.character.map((tag) => (
                              <DropdownMenu key={tag}>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-green-500/20 border-green-500/50 text-green-400"
                                  >
                                    {tag}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    newSearchWithTag(tag);
                                    setSelectedPost(null);
                                  }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('addToSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    removeSearchTerm(tag);
                                  }}>
                                    <Minus className="w-4 h-4 mr-2" />
                                    {t('removeFromSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSearchTerms([tag]);
                                    setCurrentPage(1);
                                    setSelectedPost(null);
                                  }}>
                                    <Search className="w-4 h-4 mr-2" />
                                    {t('newSearchWithTag')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    copyToClipboard(tag);
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('copy')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Copyright tags */}
                      {selectedPost.tagCategories.copyright.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2 text-cyan-400">{t('copyright')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.tagCategories.copyright.map((tag) => (
                              <DropdownMenu key={tag}>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                  >
                                    {tag}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    newSearchWithTag(tag);
                                    setSelectedPost(null);
                                  }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('addToSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    removeSearchTerm(tag);
                                  }}>
                                    <Minus className="w-4 h-4 mr-2" />
                                    {t('removeFromSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSearchTerms([tag]);
                                    setCurrentPage(1);
                                    setSelectedPost(null);
                                  }}>
                                    <Search className="w-4 h-4 mr-2" />
                                    {t('newSearchWithTag')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    copyToClipboard(tag);
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('copy')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* General tags */}
                      {selectedPost.tagCategories.general.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2 text-blue-400">{t('general')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.tagCategories.general.map((tag) => (
                              <DropdownMenu key={tag}>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-blue-500/20 border-blue-500/50 text-blue-400"
                                  >
                                    {tag}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    newSearchWithTag(tag);
                                    setSelectedPost(null);
                                  }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('addToSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    removeSearchTerm(tag);
                                  }}>
                                    <Minus className="w-4 h-4 mr-2" />
                                    {t('removeFromSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSearchTerms([tag]);
                                    setCurrentPage(1);
                                    setSelectedPost(null);
                                  }}>
                                    <Search className="w-4 h-4 mr-2" />
                                    {t('newSearchWithTag')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    copyToClipboard(tag);
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('copy')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Meta tags */}
                      {selectedPost.tagCategories.meta.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-2 text-orange-400">{t('meta')}</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPost.tagCategories.meta.map((tag) => (
                              <DropdownMenu key={tag}>
                                <DropdownMenuTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-orange-500/20 border-orange-500/50 text-orange-400"
                                  >
                                    {tag}
                                  </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => {
                                    newSearchWithTag(tag);
                                    setSelectedPost(null);
                                  }}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('addToSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    removeSearchTerm(tag);
                                  }}>
                                    <Minus className="w-4 h-4 mr-2" />
                                    {t('removeFromSearch')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSearchTerms([tag]);
                                    setCurrentPage(1);
                                    setSelectedPost(null);
                                  }}>
                                    <Search className="w-4 h-4 mr-2" />
                                    {t('newSearchWithTag')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    copyToClipboard(tag);
                                  }}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('copy')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback for posts without categorized tags
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags?.map((tag) => (
                        <DropdownMenu key={tag}>
                          <DropdownMenuTrigger asChild>
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-purple-500/20"
                            >
                              {tag}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              newSearchWithTag(tag);
                              setSelectedPost(null);
                            }}>
                              <Plus className="w-4 h-4 mr-2" />
                              {t('addToSearch')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              removeSearchTerm(tag);
                            }}>
                              <Minus className="w-4 h-4 mr-2" />
                              {t('removeFromSearch')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSearchTerms([tag]);
                              setCurrentPage(1);
                              setSelectedPost(null);
                            }}>
                              <Search className="w-4 h-4 mr-2" />
                              {t('newSearchWithTag')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              copyToClipboard(tag);
                            }}>
                              <Copy className="w-4 h-4 mr-2" />
                              {t('copy')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}