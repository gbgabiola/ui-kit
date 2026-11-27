import type { ComponentType } from 'react';

export interface DemoMetadata {
  component: string;
  category: string;
  description: string;
  order?: number;
  wide?: boolean;
}
export interface DemoModule {
  meta: DemoMetadata;
  Example: ComponentType;
}
