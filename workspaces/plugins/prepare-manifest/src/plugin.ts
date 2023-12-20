import { Plugin } from "@yarnpkg/core";
import { PrepareManifestCommand } from "./prepare-manifest-command";

const plugin: Plugin = {
  commands: [
    PrepareManifestCommand,
  ],
};

export default plugin;