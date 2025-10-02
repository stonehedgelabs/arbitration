export class TwitterSearchResponse {
  tweets: TwitterTweet[];
  has_next_page: boolean;
  next_cursor?: string;

  constructor(data: any) {
    this.tweets = data.tweets?.map((tweet: any) => new TwitterTweet(tweet)) || [];
    this.has_next_page = data.has_next_page || false;
    this.next_cursor = data.next_cursor;
  }

  static fromJSON(data: any): TwitterSearchResponse {
    return new TwitterSearchResponse(data);
  }
}

export class TwitterTweet {
  type: string;
  id: string;
  url: string;
  text: string;
  source: string;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  view_count: number;
  created_at: string;
  lang: string;
  bookmark_count: number;

  constructor(data: any) {
    this.type = data.type || '';
    this.id = data.id || '';
    this.url = data.url || '';
    this.text = data.text || '';
    this.source = data.source || '';
    this.retweet_count = data.retweetCount || 0;
    this.reply_count = data.replyCount || 0;
    this.like_count = data.likeCount || 0;
    this.quote_count = data.quoteCount || 0;
    this.view_count = data.viewCount || 0;
    this.created_at = data.createdAt || '';
    this.lang = data.lang || '';
    this.bookmark_count = data.bookmarkCount || 0;
  }
}