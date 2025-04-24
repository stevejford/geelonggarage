import * as React from "react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Pre-defined GIFs from GIPHY
const STATIC_GIFS = [
  {
    id: "1",
    title: "Thumbs Up",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY2JrZXBnNnE2bWt4ZnJ5NnF1aWIzNHg1aHd1bWx1ZWdxbWppZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4q8cJzGdR9J8w3hS/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY2JrZXBnNnE2bWt4ZnJ5NnF1aWIzNHg1aHd1bWx1ZWdxbWppZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4q8cJzGdR9J8w3hS/giphy.gif"
  },
  {
    id: "2",
    title: "Thank You",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QAsBwSjx9zVKoGp9nr/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QAsBwSjx9zVKoGp9nr/giphy.gif"
  },
  {
    id: "3",
    title: "Applause",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZdUnQS4AXEl1AERdil/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZdUnQS4AXEl1AERdil/giphy.gif"
  },
  {
    id: "4",
    title: "Laugh",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10JhviFuU2gWD6/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/10JhviFuU2gWD6/giphy.gif"
  },
  {
    id: "5",
    title: "Excited",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MeIucAjPKoA120R7sN/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MeIucAjPKoA120R7sN/giphy.gif"
  },
  {
    id: "6",
    title: "Sad",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OPU6wzx8JrHna/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OPU6wzx8JrHna/giphy.gif"
  },
  {
    id: "7",
    title: "Confused",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPCcdNniyf0ArS/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7btPCcdNniyf0ArS/giphy.gif"
  },
  {
    id: "8",
    title: "Facepalm",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TJawtKM6OCKkvwCIqX/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TJawtKM6OCKkvwCIqX/giphy.gif"
  },
  {
    id: "9",
    title: "Celebration",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/artj92V8o75VPL7AeQ/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/artj92V8o75VPL7AeQ/giphy.gif"
  },
  {
    id: "10",
    title: "Thinking",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDn976rzVgky4/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDn976rzVgky4/giphy.gif"
  },
  {
    id: "11",
    title: "OK",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abKhOpu0NwenYsw/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abKhOpu0NwenYsw/giphy.gif"
  },
  {
    id: "12",
    title: "Wow",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5VKbvrjxpVJCM/giphy.gif",
    preview: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWRjMnJnZWJnMnJnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZnRnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5VKbvrjxpVJCM/giphy.gif"
  }
];

interface StaticGifPickerProps {
  onGifSelect: (gifUrl: string) => void;
  children: React.ReactNode;
}

export function StaticGifPicker({ onGifSelect, children }: StaticGifPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGifs = searchQuery.trim()
    ? STATIC_GIFS.filter(gif =>
        gif.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : STATIC_GIFS;

  const handleGifClick = (gifUrl: string) => {
    console.log("Static GIF selected:", gifUrl);
    onGifSelect(gifUrl);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 border-none shadow-xl"
        side="top"
        align="center"
        sideOffset={10}
      >
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search GIFs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="text-sm font-medium text-gray-500">
            {searchQuery.trim() ? "Search Results" : "Popular GIFs"}
          </div>

          {filteredGifs.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-500">
              No GIFs found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {filteredGifs.map((gif) => (
                <button
                  key={gif.id}
                  className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                  onClick={() => handleGifClick(gif.url)}
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
