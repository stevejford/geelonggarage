import * as React from "react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { Grid } from "@giphy/react-components";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

// Get API key from environment variables
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || "pVLRoKGAHC1eWdDJyNSGvEEONDqtOe57";

// Initialize the GIPHY SDK
const gf = new GiphyFetch(GIPHY_API_KEY);

interface DynamicGifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  children: React.ReactNode;
}

export function DynamicGifPicker({ onGifSelect, children }: DynamicGifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Function to fetch GIFs based on search query or trending
  const fetchGifs = (offset: number) => {
    if (searchQuery.trim()) {
      return gf.search(searchQuery, { offset, limit: 10, rating: 'g' });
    }
    return gf.trending({ offset, limit: 10, rating: 'g' });
  };

  const handleGifClick = (gif: any) => {
    // Get the original GIF URL
    const originalGif = gif.images.original.url;
    onGifSelect(originalGif);
    setIsOpen(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // The Grid component will handle the actual search
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
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
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              size="sm" 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
          
          <div className="text-sm font-medium text-gray-500">
            {searchQuery.trim() ? "Search Results" : "Trending GIFs"}
          </div>
          
          <div className="h-60 overflow-y-auto">
            {isSearching ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Grid
                key={searchQuery} // Force re-render when search changes
                width={280}
                columns={2}
                fetchGifs={fetchGifs}
                onGifClick={handleGifClick}
                noLink={true}
                hideAttribution={false}
              />
            )}
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            Powered by GIPHY
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
