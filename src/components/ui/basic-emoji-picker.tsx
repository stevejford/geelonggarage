import * as React from "react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Common emojis
const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
  "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "❣️", "💕", "💞",
  "👍", "👎", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✌️", "🤞",
  "🎉", "🎊", "🎈", "🎂", "🎁", "🎄", "🎃", "🎗️", "🎟️", "🎫"
];

interface BasicEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children: React.ReactNode;
}

export function BasicEmojiPicker({ onEmojiSelect, children }: BasicEmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 border-none shadow-xl"
        side="top"
        align="center"
        sideOffset={10}
      >
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji, index) => (
            <button
              key={index}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-gray-100 text-lg"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
