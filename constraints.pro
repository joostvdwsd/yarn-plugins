gen_enforced_dependency(WorkspaceCwd, DependencyIdent, DependencyRange2, DependencyType) :-
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, DependencyRange, DependencyType),
  workspace_has_dependency(OtherWorkspaceCwd, DependencyIdent, DependencyRange2, DependencyType2),
  DependencyRange \= DependencyRange2.

gen_enforced_dependency(WorkspaceCwd, DependencyIdent, 'workspace:^', DependencyType) :-
  workspace_ident(_, DependencyIdent),
  workspace_has_dependency(WorkspaceCwd, DependencyIdent, _, DependencyType).

gen_enforced_field(WorkspaceCwd, 'scripts.release', 'yarn local publish') :- isPlugin(WorkspaceCwd).
gen_enforced_field(WorkspaceCwd, 'scripts.build:prod', 'yarn tsc --noEmit && yarn local build --production') :- isPlugin(WorkspaceCwd).

isPlugin(WorkspaceCwd) :- 
  sub_atom(WorkspaceCwd, 0, _, _, 'workspaces/plugins/').
