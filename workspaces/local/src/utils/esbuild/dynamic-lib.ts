import { getDynamicLibs } from '@yarnpkg/cli';

const pathRegExp = /^(?![a-zA-Z]:[\\/]|\\\\|\.{0,2}(?:\/|$))((?:@[^/]+\/)?[^/]+)\/*(.*|)$/;

const notDynamic = [
  'typanion'
];

const isDynamicLib = (request: any) => {
  if (getDynamicLibs().has(request)) {
    return !notDynamic.includes(request);
  }

  if (request.match(/^@yarnpkg\/plugin-/))
    return true;

  return false;
};

export function getDynamicLibResolverPlugin(currentPluginName: string) {
  return {
    name: `dynamic-lib-resolver`,
    setup: (build: any) => {
      build.onResolve({filter: /()/}, async (args: any) => {
        const dependencyNameMatch = args.path.match(pathRegExp);
        if (dependencyNameMatch === null)
          return undefined;

        const [, dependencyName] = dependencyNameMatch;
        if (dependencyName === currentPluginName || !isDynamicLib(args.path))
          return undefined;

          return {
          path: args.path,
          external: true,
        };
      });
    }
  }
};
