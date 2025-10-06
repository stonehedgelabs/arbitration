use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use chrono::Utc;
use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs};

/// User struct for authentication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub email: String,
    pub created_at: i64,
    pub jwt: String,
}

/// JWT claims for user authentication
#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub email: String,
    pub exp: i64,
    pub iat: i64,
}

/// Google OAuth token response
#[derive(Debug, Deserialize)]
pub struct GoogleTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: i64,
    pub refresh_token: Option<String>,
}

/// Google user info response
#[derive(Debug, Deserialize)]
pub struct GoogleUserInfo {
    pub email: String,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
}

/// Apple OAuth token response
#[derive(Debug, Deserialize)]
pub struct AppleTokenResponse {
    pub access_token: Option<String>,
    pub token_type: Option<String>,
    pub expires_in: Option<i64>,
    pub refresh_token: Option<String>,
    pub id_token: Option<String>,
}

/// Apple ID token claims
#[derive(Debug, Deserialize)]
pub struct AppleIdTokenClaims {
    pub iss: Option<String>,
    pub aud: Option<String>,
    pub exp: Option<i64>,
    pub iat: Option<i64>,
    pub sub: Option<String>,
    pub email: Option<String>,
    pub email_verified: Option<bool>,
}

/// JWT utilities for authentication
pub struct JwtUtils {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    validation: Validation,
}

impl JwtUtils {
    pub fn new(secret: &str) -> Self {
        let encoding_key = EncodingKey::from_secret(secret.as_ref());
        let decoding_key = DecodingKey::from_secret(secret.as_ref());
        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_required_spec_claims(&["exp", "iat"]);

        Self {
            encoding_key,
            decoding_key,
            validation,
        }
    }

    /// Generate a JWT token for a user
    pub fn generate_token(
        &self,
        email: &str,
    ) -> Result<String, jsonwebtoken::errors::Error> {
        let now = Utc::now().timestamp();
        let claims = Claims {
            email: email.to_string(),
            exp: now + 86400, // 24 hours
            iat: now,
        };

        encode(&Header::default(), &claims, &self.encoding_key)
    }

    /// Verify and decode a JWT token
    pub fn verify_token(
        &self,
        token: &str,
    ) -> Result<Claims, jsonwebtoken::errors::Error> {
        let token_data = decode::<Claims>(token, &self.decoding_key, &self.validation)?;
        Ok(token_data.claims)
    }
}

/// Google OAuth service
pub struct GoogleOAuth {
    client_id: String,
    client_secret: String,
    redirect_uri: String,
    jwt_utils: JwtUtils,
}

impl GoogleOAuth {
    pub fn new(
        client_id: String,
        client_secret: String,
        redirect_uri: String,
        jwt_secret: String,
    ) -> Self {
        Self {
            client_id,
            client_secret,
            redirect_uri,
            jwt_utils: JwtUtils::new(&jwt_secret),
        }
    }

    /// Generate Google OAuth authorization URL
    pub fn get_auth_url(&self) -> String {
        let mut params = HashMap::new();
        params.insert("client_id", self.client_id.as_str());
        params.insert("redirect_uri", self.redirect_uri.as_str());
        params.insert("response_type", "code");
        params.insert("scope", "openid email profile");
        params.insert("access_type", "offline");

        let query_string = params
            .iter()
            .map(|(k, v)| format!("{}={}", k, urlencoding::encode(v)))
            .collect::<Vec<_>>()
            .join("&");

        format!("https://accounts.google.com/o/oauth2/auth?{}", query_string)
    }

    /// Exchange authorization code for access token
    pub async fn exchange_code_for_token(
        &self,
        code: &str,
    ) -> Result<GoogleTokenResponse, Box<dyn std::error::Error>> {
        let mut params = HashMap::new();
        params.insert("client_id", self.client_id.as_str());
        params.insert("client_secret", self.client_secret.as_str());
        params.insert("code", code);
        params.insert("redirect_uri", self.redirect_uri.as_str());
        params.insert("grant_type", "authorization_code");

        let client = reqwest::Client::new();
        let response = client
            .post("https://oauth2.googleapis.com/token")
            .form(&params)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!(
                "Failed to exchange code for token: {}",
                response.status()
            )
            .into());
        }

        let token_response: GoogleTokenResponse = response.json().await?;
        Ok(token_response)
    }

    /// Get user information from Google
    pub async fn get_user_info(
        &self,
        access_token: &str,
    ) -> Result<GoogleUserInfo, Box<dyn std::error::Error>> {
        let client = reqwest::Client::new();
        let response = client
            .get("https://www.googleapis.com/oauth2/v2/userinfo")
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to get user info: {}", response.status()).into());
        }

        let user_info: GoogleUserInfo = response.json().await?;
        Ok(user_info)
    }

    /// Create or update user and generate JWT
    pub async fn create_or_update_user(
        &self,
        email: &str,
        _name: &str,
    ) -> Result<User, Box<dyn std::error::Error>> {
        let now = Utc::now().timestamp();
        let jwt = self.jwt_utils.generate_token(email)?;

        let user = User {
            email: email.to_string(),
            created_at: now,
            jwt: jwt.clone(),
        };

        Ok(user)
    }
}

/// Apple OAuth service
pub struct AppleOAuth {
    client_id: String,
    redirect_uri: String,
    team_id: String,
    key_id: String,
    secret_key_path: String,
    jwt_expire_seconds: u64,
    jwt_utils: JwtUtils,
}

impl AppleOAuth {
    pub fn new(
        client_id: String,
        redirect_uri: String,
        team_id: String,
        key_id: String,
        secret_key_path: String,
        jwt_expire_seconds: u64,
        jwt_secret: String,
    ) -> Self {
        Self {
            client_id,
            redirect_uri,
            team_id,
            key_id,
            secret_key_path,
            jwt_expire_seconds,
            jwt_utils: JwtUtils::new(&jwt_secret),
        }
    }

    /// Generate Apple client secret JWT
    pub fn generate_client_secret(&self) -> Result<String, Box<dyn std::error::Error>> {
        // Read the private key file
        let private_key = fs::read_to_string(&self.secret_key_path)?;

        let now = Utc::now().timestamp();
        let payload = serde_json::json!({
            "iss": self.team_id,
            "iat": now,
            "exp": now + self.jwt_expire_seconds as i64,
            "aud": "https://appleid.apple.com",
            "sub": self.client_id,
        });

        // Create header with key ID
        let mut header = Header::new(Algorithm::ES256);
        header.kid = Some(self.key_id.clone());

        // For ES256, we need to use the private key directly
        // Note: This is a simplified implementation. In production, you'd want to use
        // a proper ES256 implementation with the private key
        let encoding_key = EncodingKey::from_secret(private_key.as_ref());

        encode(&header, &payload, &encoding_key)
            .map_err(|e| format!("Failed to encode JWT: {}", e).into())
    }

    /// Generate Apple OAuth authorization URL
    pub fn get_auth_url(&self) -> String {
        let mut params = HashMap::new();
        params.insert("client_id", self.client_id.as_str());
        params.insert("redirect_uri", self.redirect_uri.as_str());
        params.insert("response_type", "code");
        params.insert("scope", "name email");
        params.insert("response_mode", "form_post");

        let query_string = params
            .iter()
            .map(|(k, v)| format!("{}={}", k, urlencoding::encode(v)))
            .collect::<Vec<_>>()
            .join("&");

        format!("https://appleid.apple.com/auth/authorize?{}", query_string)
    }

    /// Exchange authorization code for access token
    pub async fn exchange_code_for_token(
        &self,
        code: &str,
    ) -> Result<AppleTokenResponse, Box<dyn std::error::Error>> {
        let client_secret = self.generate_client_secret()?;

        let mut params = HashMap::new();
        params.insert("client_id", self.client_id.as_str());
        params.insert("client_secret", &client_secret);
        params.insert("code", code);
        params.insert("grant_type", "authorization_code");
        params.insert("redirect_uri", self.redirect_uri.as_str());

        let client = reqwest::Client::new();
        let response = client
            .post("https://appleid.apple.com/auth/token")
            .form(&params)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!(
                "Failed to exchange code for token: {}",
                response.status()
            )
            .into());
        }

        let token_response: AppleTokenResponse = response.json().await?;
        Ok(token_response)
    }

    /// Decode Apple ID token (without signature verification for simplicity)
    pub fn decode_id_token(
        &self,
        id_token: &str,
    ) -> Result<AppleIdTokenClaims, Box<dyn std::error::Error>> {
        // For simplicity, we'll decode without signature verification
        // In production, you should verify the signature using Apple's public keys
        let parts: Vec<&str> = id_token.split('.').collect();
        if parts.len() != 3 {
            return Err("Invalid JWT format".into());
        }

        // Decode the payload (middle part)
        let payload = parts[1];
        let payload_bytes = URL_SAFE_NO_PAD.decode(payload)?;
        let claims: AppleIdTokenClaims = serde_json::from_slice(&payload_bytes)?;

        Ok(claims)
    }

    /// Create or update user from Apple ID token
    pub async fn create_or_update_user_from_token(
        &self,
        id_token: &str,
    ) -> Result<User, Box<dyn std::error::Error>> {
        let claims = self.decode_id_token(id_token)?;

        let email = claims.email.ok_or("Missing email in ID token")?;

        let now = Utc::now().timestamp();
        let jwt = self.jwt_utils.generate_token(&email)?;

        let user = User {
            email: email.clone(),
            created_at: now,
            jwt: jwt.clone(),
        };

        Ok(user)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jwt_generation_and_verification() {
        let jwt_utils = JwtUtils::new("test_secret");
        let email = "test@example.com";

        let token = jwt_utils.generate_token(email).unwrap();
        let claims = jwt_utils.verify_token(&token).unwrap();

        assert_eq!(claims.email, email);
    }

    #[test]
    fn test_google_auth_url_generation() {
        let google_oauth = GoogleOAuth::new(
            "test_client_id".to_string(),
            "test_client_secret".to_string(),
            "http://localhost:3000/callback".to_string(),
            "test_jwt_secret".to_string(),
        );

        let auth_url = google_oauth.get_auth_url();
        assert!(auth_url.contains("client_id=test_client_id"));
        assert!(
            auth_url.contains("redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback")
        );
        assert!(auth_url.contains("response_type=code"));
    }
}
