<!-- Fill in every section. Delete one only by writing "N/A - <reason>" in its place. -->

## Summary

<!-- What does this change in the standard, and why? 1-3 sentences. -->

## Related issues

- Closes #

## Changes

-

## Verification

<!-- What you ran and what you saw. -->

- [ ] Relative links resolve (CI runs the link check)
- [ ] `actionlint kit/workflows/*.yml .github/workflows/*.yml`
- [ ] `node --test 'skills/**/*.test.mjs'`, if the conformance script changed
- [ ] Opened the changed pages in the viewer: sidebar entry present, diagrams render, no console errors

## Checklist

- [ ] Every rule is labelled Adopted, In use, Proposed or Open, and every Proposed rule has a row in `decisions.md`
- [ ] Claims about a repo were checked against that repo; claims about versions against the registry
- [ ] A rule, its kit file, the conformance script and `adoption.md` changed together where they apply
- [ ] New pages are listed in `README.md`, `_sidebar.md` and `llms.txt`
- [ ] Nothing secret and no internals of a private project (this repository is public)
- [ ] PR title follows conventional commits
