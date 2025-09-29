import { useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SocialPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  platform: "twitter" | "instagram" | "official";
  media?: string;
  verified?: boolean;
}

interface SocialSectionProps {
  posts: SocialPost[];
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

export function SocialSection({
  posts,
  favoriteTeams,
  onToggleFavorite,
}: SocialSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower)
    );
  });

  const clearSearch = () => {
    setSearchQuery("");
  };
  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "twitter":
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            Twitter
          </Badge>
        );
      case "instagram":
        return (
          <Badge variant="outline" className="text-pink-500 border-pink-500">
            Instagram
          </Badge>
        );
      case "official":
        return <Badge className="bg-green-600">Official</Badge>;
      default:
        return <Badge variant="secondary">{platform}</Badge>;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="space-y-3 p-4 pb-20">
      <h2>Social Feed</h2>

      {/* Search Bar - only show if there are posts */}
      {posts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts, teams, players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-input-background border-0"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Search Results Info - only show if there are posts and searching */}
      {posts.length > 0 && searchQuery && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}{" "}
            for "{searchQuery}"
          </span>
          {filteredPosts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-auto p-0 text-primary"
            >
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          // No content at all
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2">No Social Content</h3>
              <p className="text-sm text-muted-foreground">
                There are no social posts available for this league yet. Check
                back later for updates from teams and players.
              </p>
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 && searchQuery ? (
          // Search returned no results
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="mb-2">No posts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try searching for different keywords or check your spelling.
              </p>
              <Button variant="outline" onClick={clearSearch}>
                Clear search
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Show posts
          filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="active:scale-[0.98] transition-transform"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ImageWithFallback
                      src={post.authorAvatar}
                      alt={post.author}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {post.author}
                        </span>
                        {post.verified && (
                          <span className="text-blue-500 text-sm">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {post.timestamp}
                        </span>
                        {getPlatformBadge(post.platform)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <p className="mb-3 leading-tight">{post.content}</p>

                {post.media && (
                  <ImageWithFallback
                    src={post.media}
                    alt="Post media"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                )}

                <div className="flex items-center justify-around pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 flex-1 justify-center"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">{formatNumber(post.likes)}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 flex-1 justify-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {formatNumber(post.comments)}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 flex-1 justify-center"
                  >
                    <Share className="w-4 h-4" />
                    <span className="text-sm">{formatNumber(post.shares)}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
