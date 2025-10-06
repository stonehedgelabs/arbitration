use serde::{Deserialize, Serialize};

pub mod game_thread;

#[derive(Debug, Serialize, Deserialize)]
pub struct RedditResponse {
    pub kind: String,
    pub data: RedditListingData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RedditListingData {
    pub modhash: Option<String>,
    pub dist: Option<u32>,
    pub children: Vec<RedditChild>,
    pub after: Option<String>,
    pub before: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RedditChild {
    pub kind: String,
    pub data: RedditPostData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RedditPostData {
    pub subreddit: Option<String>,
    pub selftext: Option<String>,
    pub author_fullname: Option<String>,
    pub title: Option<String>,
    pub name: Option<String>,
    pub score: Option<i64>,
    pub created_utc: Option<f64>,
    pub num_comments: Option<i64>,
    pub permalink: Option<String>,
    pub id: Option<String>,
    pub author: Option<String>,
    pub ups: Option<i64>,
    pub downs: Option<i64>,
    pub body: Option<String>,
    pub replies: Option<RedditReplies>, // nested comment threads
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RedditReplies {
    Listing(Box<RedditResponse>), // when replies exist
    Empty(String),                // when replies = ""
}

// Simplified structures for our API responses
#[derive(Debug, Serialize, Deserialize)]
pub struct RedditComment {
    pub id: String,
    pub author: String,
    pub content: String,
    pub timestamp: String,
    pub score: i32,
    pub permalink: String,
    pub subreddit: String,
    pub team: Option<String>, // 'away' or 'home' for game threads
    pub depth: u32,
    pub replies: Vec<RedditComment>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RedditPost {
    pub id: String,
    pub title: String,
    pub author: String,
    pub selftext: String,
    pub score: i32,
    pub num_comments: i32,
    pub created_utc: f64,
    pub permalink: String,
    pub subreddit: String,
    pub url: Option<String>,
    pub is_self: bool,
    pub team: Option<String>, // 'away' or 'home' for game threads
    pub comments: Vec<RedditComment>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RedditSearchResponse {
    pub posts: Vec<RedditPost>,
    pub total_posts: u32,
    pub subreddits_searched: Vec<String>,
    pub game_id: String,
    pub search_timestamp: String,
}

#[derive(Debug, Deserialize)]
pub struct RedditSearchQuery {
    pub subreddit: Option<String>,
    pub game_id: Option<String>,
    pub kind: Option<String>,
    pub limit: Option<u32>,
}

// Helper functions for converting Reddit API responses to our simplified format
impl RedditPostData {
    pub fn to_reddit_post(&self, team: Option<String>) -> RedditPost {
        RedditPost {
            id: self.id.clone().unwrap_or_default(),
            title: self.title.clone().unwrap_or_default(),
            author: self.author.clone().unwrap_or_default(),
            selftext: self.selftext.clone().unwrap_or_default(),
            score: self.score.unwrap_or(0) as i32,
            num_comments: self.num_comments.unwrap_or(0) as i32,
            created_utc: self.created_utc.unwrap_or(0.0),
            permalink: self.permalink.clone().unwrap_or_default(),
            subreddit: self.subreddit.clone().unwrap_or_default(),
            url: None, // Will be set if needed
            is_self: self.selftext.is_some(),
            team,
            comments: vec![], // Will be populated separately
        }
    }
}

impl RedditPostData {
    pub fn extract_comments(
        &self,
        team: Option<String>,
        depth: u32,
    ) -> Vec<RedditComment> {
        let mut comments = Vec::new();

        if let Some(replies) = &self.replies {
            match replies {
                RedditReplies::Listing(listing) => {
                    for child in &listing.data.children {
                        if let Some(comment_data) = &child.data.body {
                            let comment = RedditComment {
                                id: child.data.id.clone().unwrap_or_default(),
                                author: child.data.author.clone().unwrap_or_default(),
                                content: comment_data.clone(),
                                timestamp: if let Some(created_utc) =
                                    child.data.created_utc
                                {
                                    chrono::DateTime::from_timestamp(
                                        created_utc as i64,
                                        0,
                                    )
                                    .unwrap_or_else(chrono::Utc::now)
                                    .to_rfc3339()
                                } else {
                                    chrono::Utc::now().to_rfc3339()
                                },
                                score: child.data.score.unwrap_or(0) as i32,
                                permalink: format!(
                                    "https://reddit.com{}",
                                    child.data.permalink.clone().unwrap_or_default()
                                ),
                                subreddit: child
                                    .data
                                    .subreddit
                                    .clone()
                                    .unwrap_or_default(),
                                team: team.clone(),
                                depth,
                                replies: child
                                    .data
                                    .extract_comments(team.clone(), depth + 1),
                            };
                            comments.push(comment);
                        }
                    }
                }
                RedditReplies::Empty(_) => {
                    // No replies
                }
            }
        }

        comments
    }
}
