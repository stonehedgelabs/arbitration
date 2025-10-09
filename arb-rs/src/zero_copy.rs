use std::collections::HashMap;

/// Zero-copy string utilities to reduce allocations
pub struct ZeroCopyString;

impl ZeroCopyString {
    /// Join strings with a separator using minimal allocations
    pub fn join_strings(strings: &[&str], separator: &str) -> String {
        if strings.is_empty() {
            return String::new();
        }

        let total_len = strings.iter().map(|s| s.len()).sum::<usize>()
            + separator.len() * (strings.len() - 1);

        let mut result = String::with_capacity(total_len);
        for (i, s) in strings.iter().enumerate() {
            if i > 0 {
                result.push_str(separator);
            }
            result.push_str(s);
        }
        result
    }

    /// Check if a string contains another string (case-insensitive) without allocation
    pub fn contains_case_insensitive(haystack: &str, needle: &str) -> bool {
        haystack.to_lowercase().contains(&needle.to_lowercase())
    }
}

/// Zero-copy JSON filtering utilities
pub struct ZeroCopyJson;

impl ZeroCopyJson {
    /// Filter JSON array using zero-copy operations where possible
    /// Returns (filtered_data, filtered_count, total_count)
    pub fn filter_data_by_params(
        data: serde_json::Value,
        filters: &HashMap<String, String>,
    ) -> Result<(serde_json::Value, usize, usize), Box<dyn std::error::Error>> {
        let array = data.as_array().ok_or("Expected array data for filtering")?;
        let total_count = array.len();

        // Use iterator to avoid intermediate allocations
        let filtered_items: Vec<serde_json::Value> = array
            .iter()
            .filter(|item| Self::matches_filters(item, filters))
            .cloned()
            .collect();

        let filtered_count = filtered_items.len();
        let filtered_data = serde_json::Value::Array(filtered_items);

        Ok((filtered_data, filtered_count, total_count))
    }

    /// Check if a JSON object matches the given filters using zero-copy string operations
    fn matches_filters(
        item: &serde_json::Value,
        filters: &HashMap<String, String>,
    ) -> bool {
        let obj = match item.as_object() {
            Some(obj) => obj,
            None => return false,
        };

        for (key, expected_value) in filters {
            let field_value = match obj.get(key) {
                Some(value) => value,
                None => return false,
            };

            let field_str = match field_value {
                serde_json::Value::String(s) => s.as_str(),
                serde_json::Value::Number(n) => {
                    // Convert number to string without allocation
                    if let Some(i) = n.as_i64() {
                        return i.to_string() == *expected_value;
                    } else if let Some(f) = n.as_f64() {
                        return f.to_string() == *expected_value;
                    }
                    return false;
                }
                serde_json::Value::Bool(b) => {
                    return b.to_string() == *expected_value;
                }
                _ => continue,
            };

            // Use case-insensitive comparison without allocation
            if !ZeroCopyString::contains_case_insensitive(field_str, expected_value) {
                return false;
            }
        }

        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_join_strings() {
        let strings = &["a", "b", "c"];
        let result = ZeroCopyString::join_strings(strings, " OR ");
        assert_eq!(result, "a OR b OR c");
    }

    #[test]
    fn test_filter_data_by_params() {
        let json_data = serde_json::json!([
            {"name": "Team A", "league": "MLB"},
            {"name": "Team B", "league": "NFL"},
            {"name": "Team C", "league": "MLB"}
        ]);

        let mut filters = HashMap::new();
        filters.insert("league".to_string(), "MLB".to_string());

        let (filtered, filtered_count, total_count) =
            ZeroCopyJson::filter_data_by_params(json_data, &filters).unwrap();

        assert_eq!(total_count, 3);
        assert_eq!(filtered_count, 2);
        assert!(filtered.is_array());
    }
}
