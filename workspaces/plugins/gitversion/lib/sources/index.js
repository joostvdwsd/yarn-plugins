"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
const restore_1 = require("./commands/restore");
const reset_1 = require("./commands/reset");
const bump_1 = require("./commands/bump");
const publish_1 = require("./commands/publish");
const check_1 = require("./commands/check");
const plugin = {
    configuration: configuration_1.GitVersionConfiguration.definition,
    commands: [
        check_1.GitVersionCheckCommand,
        restore_1.GitVersionRestoreCommand,
        reset_1.GitVersionResetCommand,
        bump_1.GitVersionBumpCommand,
        publish_1.GitVersionPublishCommand,
    ],
};
exports.default = plugin;
