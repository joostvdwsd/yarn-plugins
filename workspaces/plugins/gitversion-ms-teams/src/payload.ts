import { structUtils } from "@yarnpkg/core";
import { BranchType, GitVersionBranch, GitVersionBump } from "yarn-plugin-gitversion";


export interface PayloadUrl {
  readonly name: string;
  readonly url: string;
}

export interface PayloadProps {
  readonly bumpInfo: GitVersionBump;
  readonly branch: GitVersionBranch;
}

function formatChangeLog(changeLog: string) {
  const changelogText = changeLog
    .replace(/^\#\# .*\n/gm, '')
    .replace(/^\#\#\# (.*)\n/gm, '**$1**')
    .replace(/^\n+/, '');
  return {
    type: "TextBlock",
    separator: true,
    text: changelogText,
    wrap: true,
  }
}

export const payload = (props: PayloadProps) => {
  return {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          msteams: {
            width: "Full",
          },
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.5",
          body: [
            {
              type: "Container",
              items: [
                {
                  type: "TextBlock",
                  text: `New release: ${structUtils.stringifyIdent(props.bumpInfo.locator)} @ ${props.bumpInfo.version}`,
                  wrap: true,
                  size: "ExtraLarge",
                  weight: "Bolder",
                },
              ],
              style: "emphasis",
              bleed: true,
            },
            {
              type: "TextBlock",
              text: "Release details",
              wrap: true,
              weight: "Lighter",
            },
            {
              type: "FactSet",
              separator: true,
              facts: [
                {
                  title: "Name",
                  value: structUtils.stringifyIdent(props.bumpInfo.locator),
                },
                {
                  title: "Version",
                  value: props.bumpInfo.version,
                },
                
                {
                  title: "Branch",
                  value: `${props.branch.name} - (${props.branch.branchType} branch)`,
                },
              ],
            },
            {
              type: "TextBlock",
              text: "Changelog",
              wrap: true,
              weight: "Lighter",
            },            
            (props.bumpInfo.changelog ? formatChangeLog(props.bumpInfo.changelog) : undefined),
            // {
            //   type: "TextBlock",
            //   separator: true,
            //   text: props.bumpInfo.changelog ?  ?? (props.branch.branchType === BranchType.FEATURE ? 'No changelog due to feature branch' : 'No changelog generated'),
            //   wrap: true,
            // },
            // {
            //   type: "Container",
            //   items: [
            //     {
            //       type: "ColumnSet",
            //       columns: [
            //         {
            //           type: "Column",
            //           width: "4",
            //           items: [
            //             {
            //               type: "TextBlock",
            //               text: "Application logs",
            //               wrap: true,
            //               weight: "Lighter",
            //             },
            //           ],
            //         },
            //         {
            //           type: "Column",
            //           width: "1",
            //           items: [
            //             {
            //               type: "ActionSet",
            //               actions: [
            //                 {
            //                   type: "Action.ToggleVisibility",
            //                   title: "Show / Hide Logs",
            //                   targetElements: ["logs"],
            //                 },
            //               ],
            //             },
            //           ],
            //         },
            //       ],
            //     },
            //   ],
            // },
            // {
            //   type: "Container",
            //   style: "emphasis",
            //   id: "logs",
            //   isVisible: false,
            //   items: props.logs.map((log, index) => {
            //     return {
            //       type: "RichTextBlock",
            //       separator: true,
            //       spacing: "Large",
            //       inlines: [
            //         {
            //           type: "TextRun",
            //           text: `${SecretRotationStages[index]}\n`,
            //           wrap: false,
            //           weight: "Bolder",
            //           fontType: "Monospace",
            //         },
            //         ...log
            //           .map((message) => {
            //             const messageFormat = [
            //               "START",
            //               "END",
            //               "REPORT",
            //               "XRAY",
            //             ];

            //             return [
            //               {
            //                 type: "TextRun",
            //                 text: `${message.timestamp.toISOString()} `,
            //                 wrap: false,
            //                 weight: "Bolder",
            //                 fontType: "Monospace",
            //                 size: "Small",
            //               },
            //               messageFormat.some((format) =>
            //                 message.content.startsWith(format)
            //               )
            //                 ? {
            //                     type: "TextRun",
            //                     text: message.content,
            //                     wrap: false,
            //                     fontType: "Monospace",
            //                     size: "Small",
            //                   }
            //                 : {
            //                     type: "TextRun",
            //                     text: message.content
            //                       .split("\t")
            //                       .slice(3)
            //                       .join("\t"),
            //                     wrap: false,
            //                     color:
            //                       LogColorMapping[
            //                         message.content
            //                           .split("\t")
            //                           .slice(2, 3)
            //                           .join("")
            //                       ] ?? "Default",
            //                     fontType: "Monospace",
            //                     size: "Small",
            //                   },
            //             ];
            //           })
            //           .reduce((memo, logs) => memo.concat(...logs), []),
            //       ],
            //     };
            //   }),
            // },
          ],
        },
      },
    ],
  };
};
