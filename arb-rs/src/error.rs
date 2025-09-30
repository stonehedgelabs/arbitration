use axum::response::{IntoResponse, Response};
use reqwest::StatusCode;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Redis error: {0}")]
    Redis(#[from] redis::RedisError),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Status error: {0}")]
    Status(StatusCode),

    #[error("JSON serialization error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Base64 decode error: {0}")]
    Base64(#[from] base64::DecodeError),

    #[error("URL parse error: {0}")]
    Url(#[from] url::ParseError),

    #[error("UTF-8 decode error: {0}")]
    Utf8(#[from] std::string::FromUtf8Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Invalid league: {0}")]
    InvalidLeague(String),

    #[error("Cache miss for key: {0}")]
    CacheMiss(String),

    #[error("Server error: {0}")]
    Server(String),
}

pub type Result<T> = std::result::Result<T, Error>;

impl From<StatusCode> for Error {
    fn from(code: StatusCode) -> Self {
        Error::Status(code)
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        match self {
            Error::Status(code) => (code, format!("Error: {}", code)).into_response(),
            Error::InvalidLeague(l) => {
                (StatusCode::BAD_REQUEST, format!("Invalid league: {}", l))
                    .into_response()
            }
            _ => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            )
                .into_response(),
        }
    }
}
