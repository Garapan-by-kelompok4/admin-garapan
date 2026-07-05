---
name: code-review
description: Review code for quality, correctness, security, and adherence to project conventions
---

# Code Review

Systematic code review covering correctness, security, performance, and style.

## When to use

Use after writing or modifying code to catch issues early. Also use when asked to review, audit, or check code quality.

## Review areas

1. **Correctness** — Does the code do what it claims? Are edge cases handled?
2. **Security** — No secrets in code, proper input validation, safe patterns
3. **Performance** — No unnecessary re-renders, efficient queries, proper caching
4. **Type safety** — Proper TypeScript types, no `any` abuse, correct generics
5. **Error handling** — Try/catch where needed, proper error propagation, user-facing messages
6. **Conventions** — Follows existing patterns, consistent naming, proper imports
7. **Dependencies** — No new deps without justification, no unused imports

## Output format

Report findings as:
- **File:Line** — Issue description
- **Severity** — error | warning | info
- **Suggestion** — How to fix

Group by severity. Prioritize errors first.
