import {Plugin, Project, SettingsType, Workspace} from '@yarnpkg/core';
const axios = require('axios');

export interface ChangelogEntry {        
  version: string | null;
  title: string;
  date: string | null;
  body: string;
}

declare module '@yarnpkg/core' {
  interface ConfigurationValueMap {
    
    teamsWebhookUrl: string;
  }
}

const plugin: Plugin = {
  configuration: {
    teamsWebhookUrl: {
      description: 'The webhook to push the changes',
      type: SettingsType.STRING,
      isNullable: false,
      default: null
    }
  },
  hooks: {
    async afterPublish(project: Project, workspace: Workspace, changelogEntry: ChangelogEntry) {
      const url = project.configuration.get('teamsWebhookUrl');      
      
      let title = `${project.topLevelWorkspace.locator.name} - new release : ${changelogEntry.version}`;

      const body = {
        '@context': 'https://schema.org/extensions',
        '@type': 'MessageCard',
        'sections': [
          {
            text: changelogEntry.body
          },
        ],
        'themeColor': '0072C6',
        'summary': title,
        'title': title,
      };

      axios.interceptors.request.use(request => {
        console.log('Starting Request', JSON.stringify(request, null, 2))
        return request
      })
      await axios.post( url, body);
    }
  },
};

export default plugin;
