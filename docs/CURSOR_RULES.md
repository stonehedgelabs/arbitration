# Cursor Rules

- Never create raw cache keys** - Always use `CacheKey::method_name()` pattern
- Never set manual TTLs in cache** - Always use configured TTLs from config
- Never hardcode configuration values** - All config must come from environment variables or config files
- Never panic/unwrap, always use `?` and return results
- Always ask my permission before making large changes to make sure we're on the same page
- Always use reducer state rather than local state when using frontend state
- Always use patterns that already exist rather than making up your own patterns
- Always group imports on frontend/backend
- Don't add unecessary code comments
- Don't write "enterprise" code -- write "open source" code
