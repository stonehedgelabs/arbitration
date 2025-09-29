import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Play,
  Trophy,
  Star,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ForYouItem {
  id: string;
  type: "game" | "video" | "social" | "news";
  league: string;
  leagueColor: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  data: any;
}

interface ForYouSectionProps {
  items: ForYouItem[];
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

export function ForYouSection({
  items,
  favoriteTeams,
  onToggleFavorite,
}: ForYouSectionProps) {
  const renderGameCard = (item: ForYouItem) => {
    const game = item.data;
    return (
      <Card key={item.id} className="active:scale-[0.98] transition-transform">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  borderColor: item.leagueColor,
                  color: item.leagueColor,
                }}
              >
                {item.league}
              </Badge>
              {item.priority === "high" && (
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {item.timestamp}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                <span className="truncate">{game.awayTeam.name}</span>
              </span>
              <span className="font-mono font-medium">
                {game.awayTeam.score}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0"></div>
                <span className="truncate">{game.homeTeam.name}</span>
              </span>
              <span className="font-mono font-medium">
                {game.homeTeam.score}
              </span>
            </div>
            {game.status === "live" && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">
                  LIVE - {game.quarter}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVideoCard = (item: ForYouItem) => {
    const video = item.data;
    return (
      <Card
        key={item.id}
        className="active:scale-[0.98] transition-transform cursor-pointer group overflow-hidden"
      >
        <div className="relative">
          <ImageWithFallback
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-active:bg-black/40 transition-colors flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-90" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
            {video.duration}
          </div>
          <div className="absolute top-2 left-2">
            <Badge
              variant="outline"
              className="bg-black/50 border-white text-white"
            >
              {item.league}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium leading-tight mb-2 line-clamp-2">
            {video.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3" />
              <span>{video.views}</span>
            </div>
            <span>{item.timestamp}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSocialCard = (item: ForYouItem) => {
    const post = item.data;
    return (
      <Card key={item.id} className="active:scale-[0.98] transition-transform">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <ImageWithFallback
                src={post.authorAvatar}
                alt={post.author}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate text-sm">
                    {post.author}
                  </span>
                  {post.verified && (
                    <span className="text-blue-500 text-xs">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: item.leagueColor,
                      color: item.leagueColor,
                    }}
                  >
                    {item.league}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm mb-3 leading-tight">{post.content}</p>

          <div className="flex items-center justify-around pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Heart className="w-3 h-3" />
              <span className="text-xs">
                {post.likes > 1000
                  ? `${(post.likes / 1000).toFixed(1)}k`
                  : post.likes}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Share className="w-3 h-3" />
              <span className="text-xs">{post.shares}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNewsCard = (item: ForYouItem) => {
    const news = item.data;
    return (
      <Card
        key={item.id}
        className="active:scale-[0.98] transition-transform cursor-pointer"
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ImageWithFallback
              src={news.image}
              alt={news.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: item.leagueColor,
                    color: item.leagueColor,
                  }}
                >
                  {item.league}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {item.timestamp}
                </span>
              </div>
              <h3 className="font-medium leading-tight mb-1 line-clamp-2">
                {news.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {news.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderItem = (item: ForYouItem) => {
    switch (item.type) {
      case "game":
        return renderGameCard(item);
      case "video":
        return renderVideoCard(item);
      case "social":
        return renderSocialCard(item);
      case "news":
        return renderNewsCard(item);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 p-4 pb-20">
      <div className="flex items-center gap-2 mb-4">
        <h2>For You</h2>
        <Trophy className="w-5 h-5 text-yellow-500" />
      </div>

      {favoriteTeams.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Following</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {favoriteTeams.map((team, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="whitespace-nowrap"
              >
                {team}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">{items.map(renderItem)}</div>
    </div>
  );
}
