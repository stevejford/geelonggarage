import * as React from "react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

// Get API key from environment variables
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || "FCkpvv7ExFjZrN6fjv013nFsnGXBXcVv";

interface DynamicGifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  children: React.ReactNode;
}

interface Gif {
  id: string;
  url: string;
  preview: string;
  title: string;
}

export function DynamicGifPicker({ onGifSelect, children }: DynamicGifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch trending GIFs when the component mounts
  const gifsEmpty = gifs.length === 0;

  useEffect(() => {
    if (isOpen && gifsEmpty) {
      fetchTrendingGifs();
    }
  }, [isOpen, gifsEmpty]);

  const fetchTrendingGifs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching trending GIFs with API key:", GIPHY_API_KEY);

      // Use a CORS proxy if needed
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
      );

      console.log("GIPHY API response status:", response.status);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("GIPHY API response data:", data);

      if (!data.data || !Array.isArray(data.data)) {
        console.error("Invalid response format from GIPHY API:", data);
        throw new Error("Invalid response format from GIPHY API");
      }

      const formattedGifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url,
        title: gif.title
      }));

      console.log("Formatted GIFs:", formattedGifs.length);
      setGifs(formattedGifs);
    } catch (error: any) {
      console.error("Error fetching trending GIFs:", error);
      // Show error in UI
      setError(error.message || "Failed to load trending GIFs");
      setGifs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchGifs = async () => {
    if (!searchQuery.trim()) {
      fetchTrendingGifs();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Searching GIFs with query:", searchQuery);

      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          searchQuery
        )}&limit=20&rating=g`
      );

      console.log("GIPHY search API response status:", response.status);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("GIPHY search API response data:", data);

      if (!data.data || !Array.isArray(data.data)) {
        console.error("Invalid response format from GIPHY search API:", data);
        throw new Error("Invalid response format from GIPHY search API");
      }

      const formattedGifs = data.data.map((gif: any) => ({
        id: gif.id,
        url: gif.images.original.url,
        preview: gif.images.fixed_height_small.url,
        title: gif.title
      }));

      console.log("Formatted search results:", formattedGifs.length);
      setGifs(formattedGifs);
    } catch (error: any) {
      console.error("Error searching GIFs:", error);
      // Show error in UI
      setError(error.message || "Failed to search for GIFs");
      setGifs([]);
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
              disabled={isLoading}
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
          ) : error ? (
            <div className="h-60 flex flex-col items-center justify-center text-red-500 p-2">
              <div className="text-center mb-2">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  fetchTrendingGifs();
                }}
              >
                Try Again
              </Button>
            </div>
          ) : gifs.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-500">
              {searchQuery.trim() ? "No GIFs found" : "Loading trending GIFs..."}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {gifs.map((gif) => (
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
