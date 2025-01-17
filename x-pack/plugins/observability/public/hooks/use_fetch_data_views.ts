/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  QueryObserverResult,
  RefetchOptions,
  RefetchQueryFilters,
  useQuery,
} from '@tanstack/react-query';
import { DataView } from '@kbn/data-views-plugin/public';
import { useKibana } from '../utils/kibana_react';

export interface UseFetchDataViewsResponse {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  dataViews: DataView[] | undefined;
  refetch: <TPageData>(
    options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined
  ) => Promise<QueryObserverResult<DataView[], unknown>>;
}

interface FetchDataViewParams {
  name?: string;
  size?: number;
}

export function useFetchDataViews({
  name = '',
  size = 10,
}: FetchDataViewParams): UseFetchDataViewsResponse {
  const { dataViews } = useKibana().services;

  const { isLoading, isError, isSuccess, data, refetch } = useQuery({
    queryKey: ['fetchDataViews', name],
    queryFn: async () => {
      try {
        const response = await dataViews.find(`${name}*`, size);
        return response;
      } catch (error) {
        throw new Error(`Something went wrong. Error: ${error}`);
      }
    },
  });

  return { isLoading, isError, isSuccess, dataViews: data, refetch };
}
