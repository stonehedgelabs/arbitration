import { Play, Clock, Eye } from "lucide-react";
import { Badge, Card } from "@chakra-ui/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadTime: string;
  category: "highlights" | "analysis" | "interview" | "recap";
}

interface VideosSectionProps {
  videos: VideoItem[];
}

export function Videos({ videos }: VideosSectionProps) {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "highlights":
        return <Badge className="bg-red-600">Highlights</Badge>;
      case "analysis":
        return <Badge className="bg-blue-600">Analysis</Badge>;
      case "interview":
        return <Badge className="bg-green-600">Interview</Badge>;
      case "recap":
        return <Badge className="bg-purple-600">Recap</Badge>;
      default:
        return <Badge variant="subtle">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-3 p-4 pb-20">
      <h2>Latest Videos</h2>
      <div className="space-y-3">
        {videos.map((video) => (
          <Card.Root
            key={video.id}
            className="active:scale-[0.98] transition-transform cursor-pointer group"
          >
            <div className="relative">
              <ImageWithFallback
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute inset-0 bg-black/20 group-active:bg-black/40 transition-colors rounded-t-lg flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-90" />
              </div>
              <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-medium">
                {video.duration}
              </div>
              <div className="absolute top-3 left-3">
                {getCategoryBadge(video.category)}
              </div>
            </div>
            <Card.Body className="p-3">
              <h3 className="font-medium leading-tight mb-2 line-clamp-2">
                {video.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{video.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.uploadTime}</span>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        ))}
      </div>
    </div>
  );
}
