/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { transformError } from '@kbn/securitysolution-es-utils';
import { buildRouteValidation } from '../../../../../../utils/build_validation/route_validation';
import { buildSiemResponse } from '../../../../routes/utils';
import type { SecuritySolutionPluginRouter } from '../../../../../../types';

import type { GetSpaceHealthResponse } from '../../../../../../../common/detection_engine/rule_monitoring';
import {
  GET_SPACE_HEALTH_URL,
  GetSpaceHealthRequestBody,
} from '../../../../../../../common/detection_engine/rule_monitoring';
import { calculateHealthTimings } from '../health_timings';
import { validateGetSpaceHealthRequest } from './get_space_health_request';

/**
 * Get health overview of the current Kibana space. Scope: all detection rules in the space.
 * Returns:
 * - health stats at the moment of the API call
 * - health stats over a specified period of time ("health interval")
 * - health stats history within the same interval in the form of a histogram
 *   (the same stats are calculated over each of the discreet sub-intervals of the whole interval)
 */
export const getSpaceHealthRoute = (router: SecuritySolutionPluginRouter) => {
  router.post(
    {
      path: GET_SPACE_HEALTH_URL,
      validate: {
        body: buildRouteValidation(GetSpaceHealthRequestBody),
      },
      options: {
        tags: ['access:securitySolution'],
      },
    },
    async (context, request, response) => {
      const siemResponse = buildSiemResponse(response);

      try {
        const params = validateGetSpaceHealthRequest(request.body);

        const ctx = await context.resolve(['securitySolution']);
        const healthClient = ctx.securitySolution.getDetectionEngineHealthClient();

        const spaceHealthParameters = { interval: params.interval };
        const spaceHealth = await healthClient.calculateSpaceHealth(spaceHealthParameters);

        const responseBody: GetSpaceHealthResponse = {
          timings: calculateHealthTimings(params.requestReceivedAt),
          parameters: spaceHealthParameters,
          health: {
            ...spaceHealth,
            debug: params.debug ? spaceHealth.debug : undefined,
          },
        };

        return response.ok({ body: responseBody });
      } catch (err) {
        const error = transformError(err);
        return siemResponse.error({
          body: error.message,
          statusCode: error.statusCode,
        });
      }
    }
  );
};
