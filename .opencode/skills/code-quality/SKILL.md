---
name: code-quality
description: Run linting, type checking, and verify code quality standards are met
---

# Code Quality Check

Run automated checks and report results with actionable fixes.

## When to use

Use before committing, after making changes, or when asked to verify code quality.

## Checks to run

1. **Linting** — Run project linter (eslint, ruff, etc.) and report violations
2. **Type checking** — Run typecheck/tsc and report type errors
3. **Import validation** — Verify all imports resolve correctly
4. **Unused code** — Detect unused variables, imports, functions
5. **Format check** — Verify code matches formatter settings

## Process

1. Identify the project's check commands from package.json, Makefile, or config files
2. Run each check and capture output
3. Parse results and group by file
4. Provide specific fix suggestions for each issue
5. Summarize: total issues found, by severity

## Output format

```
## Quality Report

### Errors (must fix)
- `file.ts:42` — Description of error
  Fix: `suggested code change`

### Warnings (should fix)
- `file.ts:15` — Description of warning

### Summary
- X errors, Y warnings
- Files affected: list
```
