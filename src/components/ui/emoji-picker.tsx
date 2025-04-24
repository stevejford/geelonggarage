import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
  onChange: (emoji: string) => void;
  children: React.ReactNode;
}

export function EmojiPicker({ onChange, children }: EmojiPickerProps) {
  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme || "light";

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="p-0 border-none shadow-xl"
        side="top"
        align="end"
        sideOffset={10}
      >
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          theme={currentTheme}
          previewPosition="none"
          skinTonePosition="none"
          maxFrequentRows={1}
        />
      </PopoverContent>
    </Popover>
  );
}
