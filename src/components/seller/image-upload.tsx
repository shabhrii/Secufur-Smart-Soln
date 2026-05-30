"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { UploadCloud, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  onRemove: (url: string) => void
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  disabled
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const supabase = React.useMemo(() => {
    return createClient();
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        console.log("RUNTIME_MARKER_UPLOAD_V7");
        console.log(`[ImageUpload] Processing file: ${file.name}`);
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const uploadPromise = (async () => {
          if ("locks" in navigator) {
            const lockInfo = await navigator.locks.query();
            console.log("LOCK INFO", lockInfo);
          } else {
            console.log("LOCK INFO unavailable: navigator.locks is not supported");
          }

          console.log("[ImageUpload] V7 starting timed getSession");
          console.time("getSession");
          const sessionResult = await supabase.auth.getSession();
          console.timeEnd("getSession");
          console.log("[ImageUpload] AFTER getSession", {
            hasSession: Boolean(sessionResult.data.session),
            error: sessionResult.error,
          });

          return supabase.storage
            .from("product-images")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });
        })();

        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const timeoutPromise = new Promise<{ data: unknown, error: unknown }>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error("Upload timed out after 2 minutes. Please check your network connection.")), 120000);
        });

        let result: { data: unknown, error: unknown };
        try {
          result = await Promise.race([uploadPromise, timeoutPromise]) as { data: unknown, error: unknown };
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }

        const { error: uploadError } = result;

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        newUrls.push(data.publicUrl);
      }

      onChange([...value, ...newUrls]);
    } catch (err) {
      console.error("UPLOAD FAILED", err);
      setError(err instanceof Error ? err.message : "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden bg-muted group">
            <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {value.indexOf(url) === 0 && (
              <div className="absolute bottom-2 left-2 z-10 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
                Primary Image
              </div>
            )}
            <div
              className="w-full h-full object-cover"
              style={{ backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          </div>
        ))}
      </div>

      <div className={cn(
        "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg transition-colors bg-muted/20 hover:bg-muted/40",
        disabled || isUploading ? "opacity-50 cursor-not-allowed border-muted" : "border-muted-foreground/30 hover:border-primary/50 cursor-pointer",
        error ? "border-destructive/50" : ""
      )}>
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <UploadCloud className={cn("h-10 w-10 mb-2 opacity-50", error ? "text-destructive" : "")} />
            <p className="font-medium text-sm">Click or drag images to upload</p>
            <p className="text-xs mt-1">JPEG, PNG up to 5MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={disabled || isUploading}
          onChange={handleUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
