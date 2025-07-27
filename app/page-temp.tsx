'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, X, ImageIcon, FileImage, Tag, User, Calendar, TrendingUp, 
  Shuffle, Clock, Copy, Download, ChevronLeft, ChevronRight, ChevronUp, 
  Plus, Minus
} from "lucide-react";
import { VideoPlayer } from "@/app/components/video-player";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { fetchPostsFromApi, ApiPost, PostSource } from "@/lib/api";

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

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedSource, setSelectedSource] = useState<PostSource>("e621");
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<string>("score");

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await fetchPostsFromApi({
        tags: searchTerms.join(' '),
        source: selectedSource,
        page: currentPage,
        orderBy,
      });
      if (posts.length === 0) {
        setError("No se encontraron resultados");
      } else {
        setPosts(posts);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error desconocido");
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerms, selectedSource, currentPage, orderBy]);

  useEffect(() => {
    search();
  }, [search]);

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

  return (
    <main className="flex flex-col items-stretch min-h-screen w-full max-w-7xl mx-auto p-4">
      {/* Search Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="w-full flex flex-col gap-4 mb-8"
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-1 relative min-w-[260px]">
            <Input
              placeholder="Agregar tags..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="bg-background"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-purple-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
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
              <DropdownMenuLabel>Fuente</DropdownMenuLabel>
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
                    ? "Mejor puntuados"
                    : orderBy === "date"
                    ? "Más recientes"
                    : orderBy === "random"
                    ? "Aleatorio"
                    : ""}
                </span>
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={orderBy} onValueChange={handleOrderByChange}>
                <DropdownMenuRadioItem value="score">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Mejor puntuados
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Más recientes
                  </div>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="random">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    Aleatorio
                  </div>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="submit"
            onClick={handleSearchSubmit}
            disabled={!searchValue.trim()}
            className="w-full sm:w-auto hover:bg-purple-500"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar
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
          Loading...
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
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="overflow-hidden group relative cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                {getPostType(post) === "video" ? (
                  <VideoPlayer
                    src={post.file_url}
                    poster={post.preview_url}
                  />
                ) : (
                  <div className="aspect-square bg-purple-950/20">
                    <img
                      src={post.preview_url}
                      alt={post.tags.join(", ")}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => handleNewPage("prev")}
              disabled={currentPage === 1}
              className="hover:bg-purple-500/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <span className="text-lg font-medium">{currentPage}</span>
            <Button
              variant="outline"
              onClick={() => handleNewPage("next")}
              disabled={posts.length === 0}
              className="hover:bg-purple-500/20"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </>
      )}

      {/* Post Details */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      >
        <DialogContent className="max-w-4xl">
          {selectedPost && (
            <>
              <DialogTitle>
                {getPostType(selectedPost) === "video" ? "Video" : "Imagen"}
              </DialogTitle>
              <DialogDescription>
                {/* Descripción eliminada por solicitud del usuario */}
              </DialogDescription>
              <div className="flex flex-col gap-8">
                <div>
                  {/* Post preview */}
                  {getPostType(selectedPost) === "video" ? (
                    <div className="w-full h-auto aspect-video bg-purple-950/20 rounded-lg overflow-hidden">
                      <VideoPlayer
                        src={selectedPost.file_url}
                        poster={selectedPost.preview_url}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-auto aspect-video bg-purple-950/20 rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={selectedPost.file_url}
                        alt={selectedPost.tags.join(", ")}
                        className="max-w-full max-h-[70vh] object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-6">
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-purple-500/20"
                      onClick={() => {
                        if (!selectedPost?.file_url) return;
                        navigator.clipboard.writeText(selectedPost.file_url);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar URL
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 hover:bg-purple-500/20"
                      onClick={() => {
                        if (!selectedPost?.file_url) return;
                        const link = document.createElement("a");
                        link.href = selectedPost.file_url;
                        link.download = "image";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>

                  {/* Artist section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Artista
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.artists?.map((artist) => (
                        <Badge
                          key={artist}
                          variant="secondary"
                          className="cursor-pointer hover:bg-purple-500/20"
                          onClick={() => {
                            setSelectedPost(null);
                            newSearchWithTag(artist);
                          }}
                        >
                          {artist}
                        </Badge>
                      ))}
                      {(!selectedPost.artists || selectedPost.artists.length === 0) && (
                        <span className="text-muted-foreground text-sm">Artista desconocido</span>
                      )}
                    </div>
                  </div>

                  {/* Tags section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-purple-500/20"
                          onClick={() => {
                            setSelectedPost(null);
                            newSearchWithTag(tag);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
