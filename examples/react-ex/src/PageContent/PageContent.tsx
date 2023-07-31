import React from 'react';
import './PageContent.css';
import { Spin } from 'antd';

export type PageContentProps = {
  loading: boolean;
  children: React.ReactNode;
};

export function PageContent({ loading, children }: PageContentProps) {
  return (
    <div className="pageContentWrapper">
      {loading && <Spin className="pageContentWrapper_spinner" />}
      {children}
    </div>
  );
}
