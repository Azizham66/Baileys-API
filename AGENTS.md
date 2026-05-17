# Agent Instructions: Strict Clean Code & Git Rules

These instructions define the strict rules for code generation, refactoring, and version control. All agents and developers must adhere to these policies.

## 1. Clean Code Rules (Strict)

- **Single Responsibility Principle (SRP):** Functions, methods, and classes must have only one reason to change and perform exactly one distinct action.
- **Descriptive Naming:** Use clear, intention-revealing, and searchable names for variables, functions, and classes. Strictly avoid cryptic abbreviations (e.g., use `customerRecord` instead of `custRec`).
- **No Magic Numbers/Strings:** Extract all literal values into well-named constants at the top of the file or in a dedicated constants module.
- **DRY (Don't Repeat Yourself):** Never duplicate code. Abstract shared logic into reusable utility functions or services.
- **Early Returns (Guard Clauses):** Handle edge cases and errors at the top of functions to minimize nesting and improve readability. Avoid deep `if/else` structures.
- **Type Safety & Linting:** 
  - Ensure zero linting or type-checker errors.
  - Suppressions (e.g., `// @ts-ignore`, `eslint-disable`) are strictly prohibited unless accompanied by a detailed comment explaining why it is absolutely necessary.
- **Short Functions:** Keep functions small. If a function exceeds 20-30 lines, consider breaking it down into smaller helper functions.

## 2. Git & Version Control Rules (Strict)

- **Conventional Commits:** ALL commit messages MUST follow the Conventional Commits specification.
  - Allowed types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`.
  - Format: `<type>(<optional scope>): <description>` (e.g., `feat(auth): implement JWT validation`).
- **Descriptive Body:** Commits that are non-trivial must include a body explaining *why* the change was made and *how* it addresses the problem.
- **Branch Naming Standard:** Branches MUST follow the `<type>/<kebab-case-description>` format.
  - **Examples:** `feat/user-login-flow`, `fix/memory-leak-in-parser`, `chore/update-dependencies`.
- **Atomic Commits:** Each commit must represent a single, self-contained logical change. Do not mix refactoring with formatting or new feature additions in the same commit.
- **Clean History:** Rebase and squash messy / "work-in-progress" (WIP) commits before merging or opening a Pull Request.
- **No Direct Commits:** Direct commits to the `main` or `master` branches are strictly prohibited. All changes must be processed through a Pull Request and reviewed.
