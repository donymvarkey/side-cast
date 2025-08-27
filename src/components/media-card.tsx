import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";

const MediaCard = ({
  name,
  path,
  type,
  showImage,
  deleteMedia,
}: {
  name: string;
  path: string;
  type: string;
  showImage: (path: string) => void;
  deleteMedia: (path: string) => void;
}) => {
  const renderMediaPreview = (type: string, path: string) => {
    const baseClasses =
      "rounded-md transition-transform duration-300 ease-in-out shadow-md";

    if (type === "recordings") {
      return (
        <video
          src={`sidecast://${path}`}
          controls={false}
          className={`${baseClasses} hover:scale-105 hover:shadow-lg`}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (type === "screenshots") {
      return (
        <img
          src={`sidecast://${path}`}
          alt={name}
          className={`${baseClasses} hover:scale-110 hover:shadow-xl`}
        />
      );
    }
  };

  return (
    <Card
      role="button"
      onClick={() => showImage(path)}
      className="group bg-gray-900 hover:shadow-2xl hover:shadow-gray-800/40 transition-all duration-300 border-0 rounded-2xl overflow-hidden cursor-pointer p-0"
    >
      <CardContent className="p-0">
        {/* Media Preview */}
        <div className="relative w-full flex items-center justify-center group overflow-hidden rounded-lg max-h-[200px]">
          {renderMediaPreview(type, path)}

          {/* Full-Space Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[3px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                deleteMedia(path);
              }}
              size="icon"
              className="bg-red-600 hover:bg-red-700 rounded-full p-3 transform hover:scale-110 transition-transform duration-200"
            >
              <Trash className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
