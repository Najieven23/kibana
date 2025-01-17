/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import {
  EuiAccordion,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiTitle,
  EuiText,
  IconType,
  EuiPanel,
} from '@elastic/eui';

export interface EsreGuideAccordionProps {
  id: string;
  icon: IconType;
  title: string;
  description: string;
  initialIsOpen?: boolean;
}

export const EsreGuideAccordion: React.FC<EsreGuideAccordionProps> = ({
  id,
  icon,
  title,
  description,
  initialIsOpen = false,
  children,
}) => {
  return (
    <EuiPanel hasBorder paddingSize="l">
      <EuiAccordion
        id={id}
        initialIsOpen={initialIsOpen}
        buttonContent={
          <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiIcon type={icon} size="xxl" />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiFlexGroup direction="column" responsive={false} gutterSize="xs">
                <EuiFlexItem grow={false}>
                  <EuiTitle size="s">
                    <h3>{title}</h3>
                  </EuiTitle>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiText>
                    <p>{description}</p>
                  </EuiText>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
      >
        {children}
      </EuiAccordion>
    </EuiPanel>
  );
};
