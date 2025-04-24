import * as React from "react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  children: React.ReactNode;
  apiKey?: string;
}

interface Gif {
  id: string;
  url: string;
  preview: string;
  title: string;
}

export function SimpleGifPicker({ onGifSelect, children, apiKey = "pVLRoKGAHC1eWdDJyNSGvEEONDqtOe57" }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<Gif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch trending GIFs when the component mounts
  useEffect(() => {
    if (isOpen && trendingGifs.length === 0) {
      fetchTrendingGifs();
    }
  }, [isOpen]);

  const fetchTrendingGifs = async () => {
    console.log("Fetching trending GIFs...");
    setIsLoading(true);
    try {
      const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Received data:", data);

      const formattedGifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url,
        title: gif.title
      }));

      console.log("Formatted GIFs:", formattedGifs.length);
      setTrendingGifs(formattedGifs);
    } catch (error) {
      console.error("Error fetching trending GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchGifs = async () => {
    console.log("Searching for GIFs with query:", searchQuery);
    if (!searchQuery.trim()) {
      setGifs([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
        searchQuery
      )}&limit=20&rating=g`;
      console.log("Search URL:", url);

      const response = await fetch(url);
      console.log("Search response status:", response.status);

      const data = await response.json();
      console.log("Search results:", data);

      const formattedGifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url,
        title: gif.title
      }));

      console.log("Formatted search results:", formattedGifs.length);
      setGifs(formattedGifs);
    } catch (error) {
      console.error("Error searching GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchGifs();
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    onGifSelect(gifUrl);
    setIsOpen(false);
  };

  const displayGifs = searchQuery.trim() ? gifs : trendingGifs;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 border-none shadow-xl"
        side="top"
        align="end"
        sideOffset={10}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search GIFs..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <Button
              size="sm"
              onClick={searchGifs}
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          <div className="text-sm font-medium text-gray-500">
            {searchQuery.trim() ? "Search Results" : "Trending GIFs"}
          </div>

          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : displayGifs.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-500">
              {searchQuery.trim() ? "No GIFs found" : "Loading trending GIFs..."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {displayGifs.map((gif) => (
                <button
                  key={gif.id}
                  className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                  onClick={() => handleGifSelect(gif.url)}
                  title={gif.title}
                >
                  <img
                    src={gif.preview}
                    alt={gif.title}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="text-xs text-gray-400 text-center">
            Powered by GIPHY
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
