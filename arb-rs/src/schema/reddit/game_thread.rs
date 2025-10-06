use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct RedditListing {
    pub kind: String,
    pub data: RedditListingData,
}

#[derive(Debug, Deserialize)]
pub struct RedditListingData {
    pub dist: Option<u32>,
    pub after: Option<String>,
    pub children: Vec<RedditChild>,
}

#[derive(Debug, Deserialize)]
pub struct RedditChild {
    pub kind: String,
    pub data: RedditPost,
}

#[derive(Debug, Deserialize)]
pub struct RedditPost {
    pub id: String,
    pub title: String,
    pub selftext: String,
    pub url: String,
    pub permalink: String,
    pub author: String,
    pub subreddit: String,
    pub num_comments: Option<u32>,
    pub score: Option<i32>,
    pub ups: Option<i32>,
    pub downs: Option<i32>,
    pub created_utc: f64,
    pub stickied: Option<bool>,
    pub over_18: Option<bool>,
    pub is_video: Option<bool>,
    pub thumbnail: Option<String>,
}

/// Find a live game thread from a Reddit listing
pub fn find_live_game_thread(listing: &RedditListing) -> Option<&RedditPost> {
    listing.data.children.iter().map(|c| &c.data).find(|post| {
        let title = post.title.to_lowercase();
        title.contains("game thread")
            && !title.contains("post game")
            && !title.contains("pre game")
    })
}
