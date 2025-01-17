/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { getNetworkEvents } from '../../legacy_uptime/lib/requests/get_network_events';
import { SYNTHETICS_API_URLS } from '../../../common/constants';
import { UMServerLibs } from '../../legacy_uptime/uptime_server';
import { SyntheticsRestApiRouteFactory } from '../../legacy_uptime/routes';

export const createNetworkEventsRoute: SyntheticsRestApiRouteFactory = (libs: UMServerLibs) => ({
  method: 'GET',
  path: SYNTHETICS_API_URLS.NETWORK_EVENTS,
  validate: {
    query: schema.object({
      checkGroup: schema.string(),
      stepIndex: schema.number(),
    }),
  },
  handler: async ({ uptimeEsClient, request }): Promise<any> => {
    const { checkGroup, stepIndex } = request.query;

    return await getNetworkEvents({
      uptimeEsClient,
      checkGroup,
      stepIndex,
    });
  },
});
