import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  RefreshCw,
  FileSearch,
  Check,
  AlertTriangle,
  Lightbulb,
  Layers,
  History,
} from 'lucide-react';
import { resumesApi } from '../../api/resumes';
import { Resume, ResumeAnalysis } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Skeleton } from '../../components/ui/Skeleton';

export const ResumeAnalyzerPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumes = async (selectResumeId?: string) => {
    try {
      setIsLoading(true);
      const res = await resumesApi.getMyResumes();
      if (res.success && res.data) {
        setResumes(res.data);
        if (res.data.length > 0) {
          const toSelect = selectResumeId
            ? res.data.find((r) => r.id === selectResumeId) || res.data[0]
            : res.data[0];
          setSelectedResume(toSelect);
          if (toSelect.analyses && toSelect.analyses.length > 0) {
            setActiveAnalysis(toSelect.analyses[0]);
          } else {
            setActiveAnalysis(null);
          }
          loadAnalysisHistory(toSelect.id);
        } else {
          setSelectedResume(null);
          setActiveAnalysis(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to load resumes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalysisHistory = async (resumeId: string) => {
    try {
      const res = await resumesApi.getAnalysisHistory(resumeId);
      if (res.success && res.data) {
        setAnalysisHistory(res.data);
        if (res.data.length > 0 && !activeAnalysis) {
          setActiveAnalysis(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setAnalysisError(null);
    if (resume.analyses && resume.analyses.length > 0) {
      setActiveAnalysis(resume.analyses[0]);
    } else {
      setActiveAnalysis(null);
    }
    loadAnalysisHistory(resume.id);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = async (file: File) => {
    setUploadError(null);
    const validExtensions = ['.pdf', '.docx'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setUploadError('Only PDF and DOCX files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5MB limit.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await resumesApi.uploadResume(file);
      if (res.success && res.data) {
        await fetchResumes(res.data.id);
      } else {
        setUploadError(res.message || 'Resume upload failed.');
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Error uploading file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeResume = async () => {
    if (!selectedResume) return;
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      const res = await resumesApi.analyzeResume(selectedResume.id);
      if (res.success && res.data) {
        setActiveAnalysis(res.data);
        loadAnalysisHistory(selectedResume.id);
        // refresh list to get updated resume
        fetchResumes(selectedResume.id);
      } else {
        setAnalysisError(res.message || 'AI analysis failed.');
      }
    } catch (err: any) {
      setAnalysisError(err.response?.data?.message || 'Failed to trigger AI resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedResume) return;
    try {
      const blob = await resumesApi.downloadResume(selectedResume.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedResume.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI Resume Analyzer
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deep automated inspection of structure, ATS keyword density, formatting, and role alignment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedResume && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1.5" />
              Download v{selectedResume.version}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <UploadCloud className="w-4 h-4 mr-1.5" />
            {isUploading ? 'Uploading...' : 'Upload New Version'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.docx"
            className="hidden"
          />
        </div>
      </div>

      {uploadError && <ErrorAlert message={uploadError} onDismiss={() => setUploadError(null)} />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Versions & Upload Zone */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-indigo-400 bg-white'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {isUploading ? 'Uploading document...' : 'Click or drag file here'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supported formats: PDF, DOCX (Max 5MB)</p>
          </div>

          {/* Versions List Card */}
          <Card orientation="vertical" padding="md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Resume Versions ({resumes.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : resumes.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Resumes Uploaded"
                description="Upload your resume above to start AI structural and content analysis."
                actionLabel="Upload PDF"
                onAction={() => fileInputRef.current?.click()}
              />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {resumes.map((resume) => {
                  const isSelected = selectedResume?.id === resume.id;
                  const latestScore =
                    resume.analyses && resume.analyses.length > 0
                      ? resume.analyses[0].qualityScore
                      : null;

                  return (
                    <div
                      key={resume.id}
                      onClick={() => handleSelectResume(resume)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {resume.originalName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              v{resume.version}
                            </span>
                            <span className="text-xs text-slate-400">
                              {(resume.fileSize / 1024).toFixed(1)} KB
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {latestScore !== null ? (
                          <div
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              latestScore >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : latestScore >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {latestScore}%
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not evaluated</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Analysis History */}
          {selectedResume && analysisHistory.length > 0 && (
            <Card orientation="vertical" padding="md">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-indigo-600" />
                Score Timeline (v{selectedResume.version})
              </h3>
              <div className="space-y-2">
                {analysisHistory.map((historyItem) => (
                  <button
                    key={historyItem.id}
                    onClick={() => setActiveAnalysis(historyItem)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
                      activeAnalysis?.id === historyItem.id
                        ? 'border-indigo-500 bg-indigo-50/50 font-medium text-indigo-900'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(historyItem.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-bold text-slate-800">{historyItem.qualityScore}%</span>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Verification Disclaimer */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Student Integrity Advisory
            </p>
            <p>
              Verify all AI recommendations manually. Never add skills, projects, or credentials
              that you have not legitimately acquired.
            </p>
          </div>
        </div>

        {/* Right Column: AI Analysis Report */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedResume ? (
            <Card orientation="vertical" padding="lg">
              <EmptyState
                icon={FileSearch}
                title="Select a Resume"
                description="Upload or choose a resume version from the left panel to examine AI quality scores and actionable feedback."
              />
            </Card>
          ) : (
            <>
              {/* Selected Resume Status Header */}
              <Card orientation="vertical" padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{selectedResume.originalName}</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">v{selectedResume.version}</span>
                        <span>•</span>
                        <span>Status: {selectedResume.processingStatus}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(selectedResume.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAnalyzeResume}
                      disabled={isAnalyzing}
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      {isAnalyzing ? 'Analyzing with AI...' : activeAnalysis ? 'Re-Analyze with AI' : 'Analyze Now'}
                    </Button>
                  </div>
                </div>
              </Card>

              {analysisError && <ErrorAlert message={analysisError} onDismiss={() => setAnalysisError(null)} />}

              {/* Analysis Results View */}
              {isAnalyzing ? (
                <Card orientation="vertical" padding="lg">
                  <div className="py-12 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                      <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Running Deep Resume Diagnostics</h3>
                      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                        Extracting text layers, evaluating bullet point metrics, analyzing tech stack depth, and generating suggestions...
                      </p>
                    </div>
                  </div>
                </Card>
              ) : !activeAnalysis ? (
                <Card orientation="vertical" padding="lg">
                  <EmptyState
                    icon={Sparkles}
                    title="No AI Analysis Generated Yet"
                    description="Run the AI analyzer to inspect keyword relevance, quantify bullet points, and check formatting completeness."
                    actionLabel="Run AI Analysis"
                    onAction={handleAnalyzeResume}
                  />
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Score Card */}
                  <Card orientation="vertical" padding="lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="relative flex items-center justify-center">
                          <div
                            className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${
                              activeAnalysis.qualityScore >= 80
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                                : activeAnalysis.qualityScore >= 60
                                ? 'border-amber-500 bg-amber-50/50 text-amber-800'
                                : 'border-rose-500 bg-rose-50/50 text-rose-800'
                            }`}
                          >
                            <span className="text-3xl font-extrabold">{activeAnalysis.qualityScore}</span>
                            <span className="text-xs uppercase tracking-wider font-semibold">/ 100</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-slate-900">
                              {activeAnalysis.qualityScore >= 80
                                ? 'Strong Competitive Resume'
                                : activeAnalysis.qualityScore >= 60
                                ? 'Good Foundation — Needs Refinement'
                                : 'Needs Significant Revision'}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-600 mt-1 max-w-lg">
                            {activeAnalysis.summary ||
                              'AI analysis completed across standard industry placement rubrics and role metrics.'}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                            <span>Analyzed: {new Date(activeAnalysis.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">
                              {activeAnalysis.strengths?.length || 0} Strengths Detected
                            </span>
                            <span>•</span>
                            <span className="text-rose-700 font-medium">
                              {activeAnalysis.weaknesses?.length || 0} Areas for Improvement
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Strengths & Weaknesses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card orientation="vertical" padding="md" className="border-l-4 border-l-emerald-500">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Identified Strengths ({activeAnalysis.strengths?.length || 0})
                      </h4>
                      {activeAnalysis.strengths && activeAnalysis.strengths.length > 0 ? (
                        <ul className="space-y-2.5">
                          {activeAnalysis.strengths.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No specific strengths highlighted.</p>
                      )}
                    </Card>

                    {/* Weaknesses */}
                    <Card orientation="vertical" padding="md" className="border-l-4 border-l-rose-500">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-rose-800">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Weaknesses & Gaps ({activeAnalysis.weaknesses?.length || 0})
                      </h4>
                      {activeAnalysis.weaknesses && activeAnalysis.weaknesses.length > 0 ? (
                        <ul className="space-y-2.5">
                          {activeAnalysis.weaknesses.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No severe weaknesses flagged.</p>
                      )}
                    </Card>
                  </div>

                  {/* Missing Info & Actionable Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Missing Info */}
                    <Card orientation="vertical" padding="md" className="border-l-4 border-l-amber-500">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Missing Crucial Information ({activeAnalysis.missingInfo?.length || 0})
                      </h4>
                      {activeAnalysis.missingInfo && activeAnalysis.missingInfo.length > 0 ? (
                        <ul className="space-y-2.5">
                          {activeAnalysis.missingInfo.map((info, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                              <span>{info}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">All essential standard sections detected.</p>
                      )}
                    </Card>

                    {/* Actionable Recommendations */}
                    <Card orientation="vertical" padding="md" className="border-l-4 border-l-indigo-500">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3 text-indigo-800">
                        <Lightbulb className="w-4 h-4 text-indigo-600" />
                        Actionable Recommendations ({activeAnalysis.recommendations?.length || 0})
                      </h4>
                      {activeAnalysis.recommendations && activeAnalysis.recommendations.length > 0 ? (
                        <ul className="space-y-2.5">
                          {activeAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <ArrowRight className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No recommendations provided.</p>
                      )}
                    </Card>
                  </div>

                  {/* Parsed Extracted Data Details if available */}
                  {selectedResume.parsedData && (
                    <Card orientation="vertical" padding="md">
                      <h4 className="font-bold text-slate-900 text-sm mb-3">Parsed Resume Structural Data</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-semibold text-slate-800 mb-1">Detected Skills:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedResume.parsedData.skills?.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                                {s}
                              </span>
                            )) || <span className="text-slate-400">None detected</span>}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-semibold text-slate-800 mb-1">Education & Certifications:</p>
                          <p className="text-slate-600">
                            {selectedResume.parsedData.education || 'No parsed education details.'}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
