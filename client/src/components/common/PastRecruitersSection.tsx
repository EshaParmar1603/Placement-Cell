import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '../../api/companies';
import { Company } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Skeleton } from '../ui/Skeleton';
import { Modal } from '../ui/Modal';
import {
  Building2,
  ExternalLink,
  Search,
  Award,
  CheckCircle2,
  Briefcase,
  Globe,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

const RECRUITER_SECTOR_HIGHLIGHTS: Record<string, { tier: string; badge: string }> = {
  Google: { tier: 'Tier 1 Global Product', badge: '34.5 LPA' },
  Microsoft: { tier: 'Tier 1 Global Tech', badge: '42.0 LPA' },
  Amazon: { tier: 'Global Cloud / AWS', badge: '28.5 LPA' },
  'Tata Consultancy Services': { tier: 'Premier IT Partner', badge: '1,200+ Offers' },
  Infosys: { tier: 'Specialist Hiring', badge: '950+ Offers' },
  Accenture: { tier: 'Global Consulting', badge: '800+ Offers' },
  Capgemini: { tier: 'Digital Transformation', badge: '450+ Offers' },
  HCLTech: { tier: 'Engineering & R&D', badge: '350+ Offers' },
  'L&T Technology Services': { tier: 'Core Engineering Titan', badge: '280+ Offers' },
  Deloitte: { tier: 'Big 4 Advisory', badge: '180+ Offers' },
  Cognizant: { tier: 'Cloud & AI Engineering', badge: '500+ Offers' },
  Wipro: { tier: 'Turbo & Elite Track', badge: '600+ Offers' },
  'Samsung R&D': { tier: 'Semiconductors & AI', badge: '30.0 LPA' },
  Oracle: { tier: 'Enterprise Cloud Leader', badge: '24.0 LPA' },
  'Adani Group': { tier: 'Infrastructure Giant', badge: 'GET Trainees' },
  'Tata Motors': { tier: 'Automotive & EV Core', badge: 'Graduate Trainees' },
};

export const PastRecruitersSection: React.FC<{ limit?: number; showHeader?: boolean }> = ({
  limit,
  showHeader = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['pastRecruiters'],
    queryFn: () => companiesApi.listCompanies({ limit: 50 }),
  });

  const companies: Company[] = companiesData?.data || [];

  // Filter logic
  const filtered = companies.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.industry && comp.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comp.description && comp.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIndustry =
      selectedIndustry === 'ALL' ||
      (selectedIndustry === 'TECH' &&
        (comp.industry?.includes('Technology') || comp.industry?.includes('AI') || comp.industry?.includes('Cloud'))) ||
      (selectedIndustry === 'CONSULTING' &&
        (comp.industry?.includes('Consulting') || comp.industry?.includes('Services'))) ||
      (selectedIndustry === 'CORE' &&
        (comp.industry?.includes('Engineering') || comp.industry?.includes('Infrastructure') || comp.industry?.includes('Automotive')));

    return matchesSearch && matchesIndustry;
  });

  const displayList = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#172554] text-amber-300 font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                  CORPORATE HIRING NETWORK
                </span>
                <span className="text-xs text-stone-400 font-semibold">• Parul University</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight font-serif">
                Our Esteemed Past Recruiters & Industry Partners
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl font-medium leading-relaxed">
                Over 2,200+ global technology giants, consulting firms, and Fortune 500 conglomerates actively recruit engineering and management talent from our campus.
              </p>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Recruiters</span>
                <span className="text-sm font-black text-[#172554]">2,200+</span>
              </div>
              <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Placements</span>
                <span className="text-sm font-black text-emerald-700">20,000+</span>
              </div>
              <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Highest CTC</span>
                <span className="text-sm font-black text-amber-700">44+ LPA</span>
              </div>
              <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Fortune 500</span>
                <span className="text-sm font-black text-blue-700">50+</span>
              </div>
            </div>
          </div>

          {/* Search & Sector Filters */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: 'All Past Recruiters', value: 'ALL' },
                { label: 'Tech Giants & Cloud', value: 'TECH' },
                { label: 'IT Consulting & Services', value: 'CONSULTING' },
                { label: 'Core & Automotive', value: 'CORE' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedIndustry(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedIndustry === tab.value
                      ? 'bg-[#172554] text-white shadow-xs font-bold'
                      : 'bg-[#FAF8F5] text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recruiter by name..."
                className="w-full bg-[#FAF8F5] border border-stone-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Recruiter Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : displayList.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center text-xs text-stone-500">
          <Building2 className="w-8 h-8 mx-auto text-stone-300 mb-2 stroke-1" />
          <p className="font-bold text-stone-800">No recruiters found matching your filter.</p>
          <p className="text-stone-400 mt-1">Try resetting the search keyword or sector filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {displayList.map((comp) => {
            const meta = RECRUITER_SECTOR_HIGHLIGHTS[comp.name];

            return (
              <div
                key={comp.id}
                onClick={() => setSelectedCompany(comp)}
                className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top: Monogram & Placement Pill */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-center font-extrabold text-[#172554] text-xs shadow-2xs group-hover:bg-[#172554] group-hover:text-amber-300 transition-colors">
                      {comp.name
                        .split(' ')
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join('')}
                    </div>

                    {meta?.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EFE1] text-[#172554] border border-[#EADFC9]">
                        {meta.badge}
                      </span>
                    )}
                  </div>

                  {/* Company Name & Sector */}
                  <div className="mb-2">
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#1E3A8A] transition-colors leading-tight truncate">
                      {comp.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-tight block mt-0.5 truncate">
                      {comp.industry || 'Corporate Recruiter'}
                    </span>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-3">
                    {comp.description || 'Verified campus recruitment partner hiring graduating students.'}
                  </p>
                </div>

                {/* Footer Strip */}
                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Partner
                  </span>
                  <span className="text-[10px] font-bold text-[#1E3A8A] flex items-center gap-0.5 group-hover:underline">
                    View Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recruiter Details Modal */}
      {selectedCompany && (
        <Modal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          title={selectedCompany.name}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] rounded-xl border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#172554] text-amber-300 font-extrabold text-sm flex items-center justify-center border border-blue-900">
                  {selectedCompany.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">{selectedCompany.name}</h4>
                  <span className="text-xs font-semibold text-stone-500">{selectedCompany.industry}</span>
                </div>
              </div>

              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-lg">
                Official Campus Recruiter
              </span>
            </div>

            <div>
              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">Company Overview</h5>
              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedCompany.description ||
                  'Global leader partnering with Parul University for annual campus recruitment drives and internship programs.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Recruitment Status</span>
                <span className="text-xs font-bold text-stone-900">Annual Campus Visiting Firm</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">Accreditation</span>
                <span className="text-xs font-bold text-stone-900">Training & Placement Cell Verified</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              {selectedCompany.websiteUrl && (
                <a
                  href={selectedCompany.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-[#FAF8F5]"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Website
                </a>
              )}
              {selectedCompany.careersUrl && (
                <a
                  href={selectedCompany.careersUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#172554] hover:bg-[#1E3A8A] text-xs font-semibold text-white shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Careers Portal
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
