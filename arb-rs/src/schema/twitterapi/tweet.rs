use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TwitterSearchResponse {
    pub tweets: Vec<TwitterTweet>,
    #[serde(rename = "has_next_page")]
    pub has_next_page: bool,
    #[serde(rename = "next_cursor")]
    pub next_cursor: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TwitterTweet {
    #[serde(rename = "type")]
    pub tweet_type: String,
    pub id: String,
    pub url: String,
    pub text: String,
    pub source: String,
    #[serde(rename = "retweetCount")]
    pub retweet_count: i64,
    #[serde(rename = "replyCount")]
    pub reply_count: i64,
    #[serde(rename = "likeCount")]
    pub like_count: i64,
    #[serde(rename = "quoteCount")]
    pub quote_count: i64,
    #[serde(rename = "viewCount")]
    pub view_count: i64,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    pub lang: String,
    #[serde(rename = "bookmarkCount")]
    pub bookmark_count: i64,
    // Allow additional fields to be ignored
    #[serde(flatten)]
    pub additional_fields: serde_json::Value,
}
