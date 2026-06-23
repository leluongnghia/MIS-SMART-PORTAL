<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Rules

- Always use npm, not bun
- **CRM Admissions (Tuyển sinh CRM) is the most critical module.** Any updates to CRM components (Leads list, Pipeline, Lịch hẹn, Tài liệu, Học phí) or DB models must maintain strict synchronization across the entire system.
- When mapping leads, always use the dual mapping helper pattern (supporting both raw DB Lead and UI mapped Lead formats) to prevent visual and count-sync mismatch bugs.
