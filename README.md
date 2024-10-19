# superorganism

![dependencies via madge](./graph.svg)

## Motivation

`superorganism` is a rework of `nps` because `nps` doesn't function super-well within ESM codebases.

## Goals

 - [ ] - Drop-in replacement for `nps`
   - It should be compatible with `package-scripts.js` / CommonJS files.
 - [ ] - There should be tooling to auto-magically upgrade an extant `package-scripts.cjs` file
   - Additional configuration can be added to the newer structure (maybe: `.superorganism/scripts` ?) 
   - This should be opt-in only, so that you can start using `superorganism` in legacy projects with no switching cost
- [ ] - There should be some means of creating templates / plugins so that we can have repeatable config across projects
- [ ] - There should be additional tooling to run things in sequence / parallel / with self-reference



