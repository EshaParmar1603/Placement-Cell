import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useOutletContext } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, getStatusBadge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { applicationsApi } from '../../api/applications';
import { ApplicationStage, Application } from '../../types';
import {
  Briefcase,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
} from 'lucide-react';

const STAGES: ApplicationStage[] = [
  'APPLIED',
  'SHORTLISTED',
  'ASSESSMENT',
  'TECHNICAL_INTERVIEW',
  'HR_INTERVIEW',
  'OFFERED',
];

export const MyApplicationsPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const queryClient = useQueryClient();

  const [withdrawApp, setWithdrawApp] = useState<Application | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['myApplicationsFull'],
    queryFn: () => applicationsApi.getMyApplications(),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: string) => applicationsApi.withdrawApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myApplicationsFull'] });
      setWithdrawApp(null);
    },
  });

  const applications = data?.data || [];

  const getStageIndex = (stage: ApplicationStage) => {
    return STAGES.indexOf(stage);
  };

  return (
    <div>
      <Header
        onOpenSidebar={openSidebar}
        title="My Applications & Status Tracker"
        subtitle="Live multi-stage recruitment status across applied placement drives"
        actions={
          <Link to="/opportunities">
            <Button size="sm">Explore More Opportunities</Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No Applications Submitted"
            description="You have not applied for any placement drives yet. Check the opportunities tab to find matching openings."
            actionLabel="Browse Opportunities"
            onAction={() => window.location.assign('/opportunities')}
          />
        ) : (
          <div className="space-y-6">
            {applications.map((app) => {
              const currentIdx = getStageIndex(app.currentStage);
              const isRejected = app.currentStage === 'REJECTED';
              const isWithdrawn = app.currentStage === 'WITHDRAWN';

              return (
                <Card key={app.id} className="overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase">
                          {app.opportunity.company?.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{app.opportunity.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Resume used: <span className="font-semibold text-slate-700">v{app.resume?.version}</span> •{' '}
                        {app.opportunity.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.currentStage)}
                      {!isRejected && !isWithdrawn && app.currentStage !== 'OFFERED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-400 hover:text-rose-600"
                          onClick={() => setWithdrawApp(app)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>

                  <CardBody className="p-6">
                    {/* Stage Progression Stepper */}
                    {isRejected ? (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                          <span className="font-bold block">Application Not Selected</span>
                          <span>The recruiter has moved forward with other applicants for this round. Keep preparing!</span>
                        </div>
                      </div>
                    ) : isWithdrawn ? (
                      <div className="p-4 rounded-xl bg-slate-100 text-slate-600 text-xs flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0" />
                        <span>You withdrew this application.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                          {STAGES.map((stage, idx) => {
                            const isCompleted = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;

                            return (
                              <div
                                key={stage}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isCurrent
                                    ? 'bg-brand-50 border-brand-400 text-brand-900 font-bold shadow-sm'
                                    : isCompleted
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                                }`}
                              >
                                <span className="text-[10px] block opacity-70">Step {idx + 1}</span>
                                <span className="capitalize">{stage.replace('_', ' ').toLowerCase()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Timeline & Notes */}
                    {app.history && app.history.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <History className="w-3.5 h-3.5 text-slate-400" />
                          <span>Status Timeline</span>
                        </div>
                        <div className="space-y-1.5 pl-5 border-l-2 border-slate-200 text-xs">
                          {app.history.map((hist) => (
                            <div key={hist.id} className="relative py-1">
                              <span className="font-semibold text-slate-800 capitalize">
                                {hist.newStage.replace('_', ' ').toLowerCase()}
                              </span>
                              <span className="text-[11px] text-slate-400 ml-2">
                                {new Date(hist.createdAt).toLocaleDateString()}
                              </span>
                              {hist.remarks && <p className="text-slate-500 mt-0.5">{hist.remarks}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}

        {/* Withdraw Confirmation Modal */}
        <Modal
          isOpen={!!withdrawApp}
          onClose={() => setWithdrawApp(null)}
          title="Withdraw Application?"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to withdraw your application for{' '}
              <span className="font-bold text-slate-900">{withdrawApp?.opportunity.title}</span> at{' '}
              <span className="font-bold text-slate-900">{withdrawApp?.opportunity.company.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setWithdrawApp(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={withdrawMutation.isPending}
                onClick={() => withdrawApp && withdrawMutation.mutate(withdrawApp.id)}
              >
                Confirm Withdraw
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
