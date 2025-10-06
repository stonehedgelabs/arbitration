/**
 * Reddit API response types - Updated to match Rust backend schema
 */

export interface RedditComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  score: number;
  permalink: string;
  subreddit: string;
  team?: string; // 'away' or 'home' for game threads
  depth: number;
  replies: RedditComment[];
}

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  subreddit: string;
  url?: string;
  is_self: boolean;
  team?: string; // 'away' or 'home' for game threads
  comments: RedditComment[];
}

export interface RedditSearchResponse {
  posts: RedditPost[];
  total_posts: number;
  subreddits_searched: string[];
  game_id: string;
  search_timestamp: string;
}

export class RedditSearchResponse {
  static fromJSON(data: any): RedditSearchResponse {
    return {
      posts: data.posts || [],
      total_posts: data.total_posts || 0,
      subreddits_searched: data.subreddits_searched || [],
      game_id: data.game_id || '',
      search_timestamp: data.search_timestamp || new Date().toISOString(),
    };
  }
}
