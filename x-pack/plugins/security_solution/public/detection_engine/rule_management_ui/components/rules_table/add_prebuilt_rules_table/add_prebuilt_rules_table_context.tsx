/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { RuleInstallationInfoForReview } from '../../../../../../common/detection_engine/prebuilt_rules/api/review_rule_installation/response_schema';
import type { RuleSignatureId } from '../../../../../../common/detection_engine/rule_schema';
import { invariant } from '../../../../../../common/utils/invariant';
import {
  usePerformInstallAllRules,
  usePerformInstallSpecificRules,
} from '../../../../rule_management/logic/prebuilt_rules/use_perform_rule_install';
import { usePrebuiltRulesInstallReview } from '../../../../rule_management/logic/prebuilt_rules/use_prebuilt_rules_install_review';

export interface AddPrebuiltRulesTableState {
  /**
   * Rules available to be installed
   */
  rules: RuleInstallationInfoForReview[];
  /**
   * All unique tags for all rules
   */
  tags: string[];
  /**
   * Is true then there is no cached data and the query is currently fetching.
   */
  isLoading: boolean;
  /**
   * Will be true if the query has been fetched.
   */
  isFetched: boolean;
  /**
   * Is true whenever a background refetch is in-flight, which does not include initial loading
   */
  isRefetching: boolean;
  /**
   * List of rule IDs that are currently being upgraded
   */
  loadingRules: RuleSignatureId[];
  /**
   * The timestamp for when the rules were successfully fetched
   */
  lastUpdated: number;
  /**
   * Rule rows selected in EUI InMemory Table
   */
  selectedRules: RuleInstallationInfoForReview[];
}

export interface AddPrebuiltRulesTableActions {
  reFetchRules: () => void;
  installOneRule: (ruleId: RuleSignatureId) => void;
  installAllRules: () => void;
  installSelectedRules: () => void;
  selectRules: (rules: RuleInstallationInfoForReview[]) => void;
}

export interface AddPrebuiltRulesContextType {
  state: AddPrebuiltRulesTableState;
  actions: AddPrebuiltRulesTableActions;
}

const AddPrebuiltRulesTableContext = createContext<AddPrebuiltRulesContextType | null>(null);

interface AddPrebuiltRulesTableContextProviderProps {
  children: React.ReactNode;
}

export const AddPrebuiltRulesTableContextProvider = ({
  children,
}: AddPrebuiltRulesTableContextProviderProps) => {
  const [loadingRules, setLoadingRules] = useState<RuleSignatureId[]>([]);
  const [selectedRules, setSelectedRules] = useState<RuleInstallationInfoForReview[]>([]);

  const {
    data: { rules, stats: { tags } } = {
      rules: [],
      stats: { tags: [] },
    },
    refetch,
    dataUpdatedAt,
    isFetched,
    isLoading,
    isRefetching,
  } = usePrebuiltRulesInstallReview({
    refetchInterval: 60000, // Refetch available rules for installation every minute
    keepPreviousData: true, // Use this option so that the state doesn't jump between "success" and "loading" on page change
  });

  const { mutateAsync: installAllRulesRequest } = usePerformInstallAllRules();
  const { mutateAsync: installSpecificRulesRequest } = usePerformInstallSpecificRules();

  const installOneRule = useCallback(
    async (ruleId: RuleSignatureId) => {
      const rule = rules.find((r) => r.rule_id === ruleId);
      invariant(rule, `Rule with id ${ruleId} not found`);

      setLoadingRules((prev) => [...prev, ruleId]);
      try {
        await installSpecificRulesRequest([{ rule_id: ruleId, version: rule.version }]);
      } finally {
        setLoadingRules((prev) => prev.filter((id) => id !== ruleId));
      }
    },
    [installSpecificRulesRequest, rules]
  );

  const installSelectedRules = useCallback(async () => {
    const rulesToUpgrade = selectedRules.map((rule) => ({
      rule_id: rule.rule_id,
      version: rule.version,
    }));
    setLoadingRules((prev) => [...prev, ...rulesToUpgrade.map((r) => r.rule_id)]);
    try {
      await installSpecificRulesRequest(rulesToUpgrade);
    } finally {
      setLoadingRules((prev) => prev.filter((id) => !rulesToUpgrade.some((r) => r.rule_id === id)));
      setSelectedRules([]);
    }
  }, [installSpecificRulesRequest, selectedRules]);

  const installAllRules = useCallback(async () => {
    // Unselect all rules so that the table doesn't show the "bulk actions" bar
    setLoadingRules((prev) => [...prev, ...rules.map((r) => r.rule_id)]);
    try {
      await installAllRulesRequest();
    } finally {
      setLoadingRules([]);
      setSelectedRules([]);
    }
  }, [installAllRulesRequest, rules]);

  const actions = useMemo(
    () => ({
      installAllRules,
      installOneRule,
      installSelectedRules,
      reFetchRules: refetch,
      selectRules: setSelectedRules,
    }),
    [installAllRules, installOneRule, installSelectedRules, refetch]
  );

  const providerValue = useMemo<AddPrebuiltRulesContextType>(() => {
    return {
      state: {
        rules,
        tags,
        isFetched,
        isLoading,
        loadingRules,
        isRefetching,
        selectedRules,
        lastUpdated: dataUpdatedAt,
      },
      actions,
    };
  }, [
    rules,
    tags,
    isFetched,
    isLoading,
    loadingRules,
    isRefetching,
    selectedRules,
    dataUpdatedAt,
    actions,
  ]);

  return (
    <AddPrebuiltRulesTableContext.Provider value={providerValue}>
      {children}
    </AddPrebuiltRulesTableContext.Provider>
  );
};

export const useAddPrebuiltRulesTableContext = (): AddPrebuiltRulesContextType => {
  const rulesTableContext = useContext(AddPrebuiltRulesTableContext);
  invariant(
    rulesTableContext,
    'useAddPrebuiltRulesTableContext should be used inside AddPrebuiltRulesTableContextProvider'
  );

  return rulesTableContext;
};
