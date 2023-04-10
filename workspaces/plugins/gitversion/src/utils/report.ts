import { CommandContext, Configuration, Report, StreamReport } from "@yarnpkg/core";
import { GitVersionConfiguration } from "./configuration";

export async function runStep(name: string, context: CommandContext, cb: (report: Report, configuration: GitVersionConfiguration) => void) {
  const yarnConfig = await Configuration.find(context.cwd, context.plugins);

  const resporter = await StreamReport.start({
    configuration: yarnConfig,
    stdout: context.stdout,
  }, async (report: StreamReport) => {
    await report.startTimerPromise(name, async () => {

      const configuration = await GitVersionConfiguration.fromContext(yarnConfig, report);

      await cb(report, configuration);
    });
  });
  resporter.exitCode();
};