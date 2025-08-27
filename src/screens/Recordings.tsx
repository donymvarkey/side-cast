import { MediaFilesType } from "@/types";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MediaCard from "@/components/media-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { toast } from "sonner";

interface MediaDataRes {
  files: MediaFilesType[];
  total: number;
  hasMore: boolean;
}

const MEDIA_MAP = {
  recordings: "Recordings",
  screenshots: "Screenshots",
};

const Recordings = () => {
  const [mediaType, setMediaType] = useState<"recordings" | "screenshots">(
    "recordings"
  );
  const [currentMedia, setCurrentMedia] = useState<string>("");
  const [enlargeMedia, setEnlargeMedia] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [media, setMedia] = useState<MediaFilesType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  const getMediaFiles = async (type: "recordings" | "screenshots") => {
    let data: MediaDataRes = { files: [], total: 0, hasMore: false };
    switch (type) {
      case "recordings": {
        data = await window.electronAPI.invoke(
          "screen:list-recordings",
          page,
          20
        );
        break;
      }
      case "screenshots": {
        data = await window.electronAPI.invoke(
          "screen:list-screenshots",
          page,
          20
        );
        break;
      }
      default:
        break;
    }
    page === 1
      ? setMedia(data?.files)
      : setMedia((prev) => [...prev, ...data.files]);
    setHasMore(data.hasMore);
  };

  const deleteMedia = (flePath: string) => {
    window.electronAPI
      .invoke("screen:delete-media-file", flePath)
      .then((res) => {
        console.log("File deleted:", res);

        if (res?.success) {
          getMediaFiles(mediaType);
          toast.success("Media deleted successfully");
        }
      });
  };

  useEffect(() => {
    getMediaFiles(mediaType);
  }, [mediaType, page]);
  return (
    <div className="flex-1 px-5 min-h-[85vh] overflow-y-hidden">
      <div className="flex items-center justify-end my-4">
        <Select
          value={mediaType}
          onValueChange={(val) =>
            setMediaType(val as "recordings" | "screenshots")
          }
        >
          <SelectTrigger className="w-[180px] text-gray-100 border focus:ring-0">
            <SelectValue placeholder="List Media Type" />
          </SelectTrigger>
          <SelectContent className="text-gray-100 bg-gray-800 border-0 ">
            <SelectItem
              className="focus:bg-gray-700 focus:text-gray-200"
              value="recordings"
            >
              Recordings
            </SelectItem>
            <SelectItem
              className="focus:bg-gray-700 focus:text-gray-200"
              value="screenshots"
            >
              Screenshots
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4 h-full overflow-y-scroll">
        {media.length > 0 ? (
          media.map((file, index) => (
            <MediaCard
              key={index}
              {...file}
              type={mediaType}
              deleteMedia={(path: string) => deleteMedia(path)}
              showImage={(path: string) => {
                setEnlargeMedia(true);
                setCurrentMedia(path);
              }}
            />
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <h1 className="text-gray-100">No {MEDIA_MAP[mediaType]} found</h1>
          </div>
        )}
      </div>
      {hasMore && (
        <div className="absolute bottom-0 w-full flex items-center justify-center mb-4">
          <Button onClick={() => setPage((prev) => prev + 1)} variant={"link"}>
            <span className="text-blue-400">Load More</span>
          </Button>
        </div>
      )}
      <Dialog open={enlargeMedia} onOpenChange={() => setEnlargeMedia(false)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[420px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4"
        >
          <DialogHeader className="text-white text-lg font-semibold flex flex-row justify-between items-center">
            <span>
              {mediaType === "recordings"
                ? "Recording Preview"
                : "Image Preview"}
            </span>
            <button
              onClick={() => setEnlargeMedia(false)}
              className="text-gray-400 hover:text-white transition"
            >
              <XIcon />
            </button>
          </DialogHeader>

          <DialogDescription className="flex justify-center items-center mt-2">
            {mediaType === "recordings" ? (
              <video
                src={`sidecast://${currentMedia}`}
                controls
                autoPlay={false}
                className="w-full max-h-[700px] rounded-lg shadow-lg border border-gray-700"
              />
            ) : (
              <img
                src={`sidecast://${currentMedia}`}
                alt="Enlarged Media"
                className="object-contain max-h-[700px] w-full rounded-lg shadow-lg border border-gray-700"
              />
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Recordings;
