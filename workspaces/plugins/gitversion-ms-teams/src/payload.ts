import { structUtils } from "@yarnpkg/core";
import { BranchType, GitVersionBranch, GitVersionBump } from "@jvdwaalsd/yarn-plugin-gitversion";


export interface PayloadUrl {
  readonly name: string;
  readonly url: string;
}

export interface PayloadProps {
  readonly bumpInfo: GitVersionBump;
  readonly branch: GitVersionBranch;
}

function formatChangeLog(changeLog?: string) {
  if (!changeLog) {
    return [{
      type: "TextBlock",
      separator: true,
      text: '<< no changelog>>',
      wrap: true,
    }];
  }
  const changelogText = changeLog
    .replace(/^\#\# .*\n/gm, '')
    .replace(/^\#\#\# (.*)\n/gm, '**$1**')
    .replace(/^\n+/, '');
  return [{
    type: "TextBlock",
    separator: true,
    text: changelogText,
    wrap: true,
  }]
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
            ...formatChangeLog(props.bumpInfo.changelog),
          ],
        },
      },
    ],
  };
};
