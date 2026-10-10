import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { PastRecruitersSection } from '../../components/common/PastRecruitersSection';

export const PastRecruitersPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  return (
    <div className="space-y-6">
      <Header
        onOpenSidebar={openSidebar}
        title="Esteemed Past Recruiters"
        subtitle="Directory of 2,200+ Corporate Hiring Partners & Fortune 500 Recruiters"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PastRecruitersSection showHeader={true} />
      </div>
    </div>
  );
};
