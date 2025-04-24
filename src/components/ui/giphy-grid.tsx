import * as React from "react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

// Define interfaces for GIPHY API responses
interface GiphyImage {
  url: string;
  width: string;
  height: string;
}

interface GiphyImages {
  fixed_height_small: {
    url: string;
    width: string;
    height: string;
  };
  original: {
    url: string;
    width: string;
    height: string;
  };
}

interface GiphyGif {
  id: string;
  title: string;
  images: GiphyImages;
}

interface GiphyResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
  meta: {
    status: number;
    msg: string;
    response_id: string;
  };
}

interface GiphyGridProps {
  onGifSelect: (gifUrl: string) => void;
  children: React.ReactNode;
  apiKey?: string;
}

export function GiphyGrid({ onGifSelect, children, apiKey = "sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh" }: GiphyGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch trending GIFs when the component mounts or when opened
  useEffect(() => {
    if (isOpen) {
      fetchTrendingGifs();
    }
  }, [isOpen]);

  const fetchTrendingGifs = async () => {
    console.log("Fetching trending GIFs...");
    setIsLoading(true);
    try {
      const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20&rating=g`;
      console.log("GIPHY API URL:", url);

      const response = await fetch(url);
      console.log("GIPHY API Response Status:", response.status);

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data: GiphyResponse = await response.json();
      console.log("GIPHY API Response Data:", data);
      console.log("Number of GIFs received:", data.data.length);
      setGifs(data.data);
    } catch (error) {
      console.error("Error fetching trending GIFs:", error);
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
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(
          searchQuery
        )}&limit=20&rating=g`
      );

      if (!response.ok) {
        throw new Error(`GIPHY API error: ${response.status}`);
      }

      const data: GiphyResponse = await response.json();
      setGifs(data.data);
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

  const handleGifClick = (gif: GiphyGif) => {
    console.log("GIF selected:", gif);
    console.log("GIF URL:", gif.images.original.url);
    onGifSelect(gif.images.original.url);
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
                  onClick={() => handleGifClick(gif)}
                  title={gif.title}
                >
                  <img
                    src={gif.images.fixed_height_small.url}
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
