/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  serviceNameHint,
  secretTokenHint,
  serverUrlHint,
  serviceEnvironmentHint,
  apiKeyHint,
} from './shared_hints';

export const javaVariables = (secretToken?: string) => ({
  apmServiceName: 'Delastic.apm.service_name',
  ...(secretToken && { secretToken: 'Delastic.apm.secret_token' }),
  ...(!secretToken && { apiKey: 'Delastic.apm.api_key' }),
  apmServerUrl: 'Delastic.apm.server_url',
  apmEnvironment: 'Delastic.apm.environment',
});

export const javaHighlightLang = 'java';

export const javaLineNumbers = (apiKey?: string | null) => ({
  start: 1,
  highlight: '',
  annotations: {
    2: serviceNameHint,
    3: apiKey ? apiKeyHint : secretTokenHint,
    4: serverUrlHint,
    5: serviceEnvironmentHint,
  },
});
export const java = `java -javaagent:/path/to/elastic-apm-agent-<version>.jar \\
-Delastic.apm.service_name=my-service-name \\
{{^secretToken}}
-Delastic.apm.api_key={{{apiKey}}} \\
{{/secretToken}}
{{#secretToken}}
-Delastic.apm.secret_token={{{secretToken}}} \\
{{/secretToken}}
-Delastic.apm.server_url={{{apmServerUrl}}} \\
-Delastic.apm.environment=my-environment \\
-Delastic.apm.application_packages=org.example \\
-jar my-service-name.jar`;
