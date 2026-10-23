<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Secret handling

- Never read, print, copy, or load `.env` or `.env.*` files.
- Exception: `.env.example` may be read only if it contains placeholders. If this is unknown, ask the user before reading it.
- Never inspect process environment variables for secrets.
