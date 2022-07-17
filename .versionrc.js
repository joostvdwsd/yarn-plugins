module.exports = {
  "types": [
    {"type": "feat", "section": "Features"},
    {"type": "fix", "section": "Bug Fixes"},
    {"type": "docs", "section": "Documentation"},
    {"type": "style", "section": "Styling"},
    {"type": "refactor", "section": "Refactors"},
    {"type": "perf", "section": "Performance"},
    {"type": "test", "section": "Tests"},
    {"type": "build", "section": "Build System"},
    {"type": "ci", "section": "CI"},
    {"type": "chore", "section": "Chore"},
    {"type": "revert", "section": "Reverts"}
  ]
}
// module.exports = {
//   parserOpts: {
//     headerPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!?: (.*)$/,
//     breakingHeaderPattern: /^(?:Merged PR \d+: )?(\w*)(?:\((.*)\))?!: (.*)$/,
//     revertPattern: /^(?:Merged PR \d+: )?(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
//   },
//   presetConfig: {
//     "compareUrlFormat": "https://dev.azure.com/aegon-nl/{{repository}}/branchCompare?baseVersion=GT{{previousTag}}&targetVersion=GT{{currentTag}}&_a=files"
//   }
// }