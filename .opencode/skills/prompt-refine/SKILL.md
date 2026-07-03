---
name: prompt-refine
description: Sharpen and refine prompts to produce more accurate, structured, and effective code generation results
---

# Prompt Refinement

Transform vague or incomplete prompts into clear, actionable instructions that yield better code output.

## When to use

Use when a prompt is ambiguous, too broad, or likely to produce generic results. Also use when reviewing prompts before sending them to improve output quality.

## How to refine

1. **Add specificity** — Include exact file paths, function names, types, and expected behavior
2. **Provide context** — Reference existing patterns, conventions, or related code in the codebase
3. **Set constraints** — Specify stack choices, security rules, language, and formatting requirements
4. **Structure the output** — Request a specific format (code block, explanation, step-by-step)
5. **Include examples** — Point to existing similar implementations for reference
6. **Define success criteria** — What the result should accomplish and how to verify it

## Refinement checklist

- Is the goal clear? (what to build, fix, or explain)
- Are technical constraints listed? (framework, language, patterns)
- Is the output format specified? (code, explanation, both)
- Are edge cases or error handling mentioned?
- Is the scope bounded? (not trying to do everything at once)
