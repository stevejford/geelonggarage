import * as React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  children: React.ReactNode;
  accept?: string;
  maxSize?: number; // in MB
}

export function FileUpload({
  onFileSelect,
  children,
  accept = "image/*",
  maxSize = 5, // Default 5MB
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    onFileSelect(file);
    setIsOpen(false);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72" side="top" align="center" sideOffset={10}>
        <div className="space-y-4 p-2">
          <h4 className="font-medium text-sm">Upload File</h4>
          <div className="grid gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={accept}
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Select File
            </Button>
            <p className="text-xs text-gray-500">
              Max file size: {maxSize}MB
              <br />
              Accepted formats: {accept.replace("*", "all")}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
