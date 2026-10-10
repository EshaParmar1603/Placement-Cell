import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { feedApi } from '../../api/feed';
import { opportunitiesApi } from '../../api/opportunities';
import { useAuth } from '../../context/AuthContext';
import { PostType } from '../../types';
import {
  MessageSquare,
  Heart,
  Share2,
  Pin,
  Sparkles,
  Send,
  PlusCircle,
  Flag,
  CheckCircle2,
  Image as ImageIcon,
  ThumbsUp,
  Award,
  ExternalLink,
  X,
  Globe,
  Building2,
  Users,
  Trophy,
} from 'lucide-react';

const PRESET_PHOTOS = [
  { label: 'Batch Placement Banner', url: '/placement-banner.png', desc: '#ProudlyPlaced Batch Record' },
  { label: 'Google SDE Achiever (34.5 LPA)', url: '/feed-google-placed.jpg', desc: 'Akshat Sharma' },
  { label: 'Mega Campus Drive 2026', url: '/feed-campus-drive.jpg', desc: '2,200+ Corporate Recruiters' },
  { label: 'Amazon AWS Achiever (28.5 LPA)', url: '/feed-amazon-placed.jpg', desc: 'Priya Patel' },
];

export const FeedPage: React.FC = () => {
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPostType, setNewPostType] = useState<PostType>('PLACEMENT_STORY');
  const [newImageUrl, setNewImageUrl] = useState<string>('/feed-google-placed.jpg');
  const [newTags, setNewTags] = useState('ProudlyPlaced, ParulUniversity');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  // Query posts
  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ['feedPosts', activeTab],
    queryFn: () =>
      feedApi.listPosts({
        postType: activeTab === 'ALL' ? undefined : (activeTab as PostType),
      }),
  });

  // Query sidebar opportunities
  const { data: oppsData } = useQuery({
    queryKey: ['openOpportunitiesSidebar'],
    queryFn: () => opportunitiesApi.listOpportunities({ status: 'PUBLISHED', limit: 3 }),
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: any) => feedApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
      setIsComposerOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setNewTags('');
    },
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: (id: string) => feedApi.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => feedApi.addComment(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
      setCommentInputs((prev) => ({ ...prev, [variables.id]: '' }));
    },
  });

  const posts = postsData?.data || [];
  const sidebarOpps = oppsData?.data || [];
  const pinnedPosts = posts.filter((p) => p.isPinned);
  const regularPosts = posts.filter((p) => !p.isPinned);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate({
      title: newTitle,
      content: newContent,
      postType: newPostType,
      imageUrl: newImageUrl || undefined,
      tags: newTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
    });
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    addCommentMutation.mutate({ id: postId, content });
  };

  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText(window.location.origin + `/feed#post-${postId}`);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      <Header
        onOpenSidebar={openSidebar}
        title="Campus Placement Feed & Achievers"
        subtitle="#ProudlyPlaced • Corporate Announcements, Star Achievers & Campus Recruitment Updates"
        actions={
          <Button
            size="sm"
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Post
          </Button>
        }
      />

      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* Parul University Institutional Showcase Ribbon */}
        <div className="bg-[#172554] rounded-2xl p-4 sm:p-5 text-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-950">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow">
              <span className="font-extrabold text-blue-900 text-sm tracking-tighter text-center leading-none">
                PARUL<br/><span className="text-[9px] text-amber-600 font-bold">NAAC A++</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Parul University Placement Cell</h2>
                <CheckCircle2 className="w-4 h-4 text-sky-300 fill-sky-300/30" />
                <span className="text-[11px] font-semibold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                  LinkedIn Official
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Celebrating student triumphs with #ProudlyPlaced • 2,200+ Recruiters • 20,000+ Dreams Fulfilled
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold text-blue-200">#ProudlyPlaced</span>
            <span className="text-xs font-semibold text-amber-300">#InfiniteDreamsFulfilled</span>
          </div>
        </div>

        {/* Post Composer Card */}
        {isComposerOpen && (
          <Card className="border-brand-200 shadow-lg">
            <CardHeader
              title="Share a Placement Story or Announcement"
              subtitle="Add high-impact photos just like Parul University LinkedIn showcases"
              action={
                <Button variant="ghost" size="sm" onClick={() => setIsComposerOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              }
            />
            <CardBody>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Post Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Star Achiever Placed at Google with 34.5 LPA!"
                    required
                  />
                  <Select
                    label="Category / Post Type"
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value as PostType)}
                    options={[
                      { label: 'Placement Story (#ProudlyPlaced)', value: 'PLACEMENT_STORY' },
                      { label: 'Official Announcement', value: 'ANNOUNCEMENT' },
                      { label: 'Interview Experience', value: 'INTERVIEW_EXPERIENCE' },
                      { label: 'Career Advice', value: 'CAREER_ADVICE' },
                      { label: 'General Discussion', value: 'GENERAL' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Post Content</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe the placement achievement, student quote, recruitment highlights, or congratulatory message..."
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                {/* Photo Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-600" />
                    Attach Placement Photo (Parul University LinkedIn Style)
                  </label>
                  
                  {/* Preset photo pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
                    {PRESET_PHOTOS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setNewImageUrl(preset.url)}
                        className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2.5 ${
                          newImageUrl === preset.url
                            ? 'border-brand-600 bg-brand-50/80 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-900 truncate">{preset.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{preset.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Input
                    label="Or Custom Image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="/placement-banner.png or https://..."
                  />

                  {newImageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-44 flex items-center justify-center">
                      <img
                        src={newImageUrl}
                        alt="Preview"
                        className="max-h-44 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewImageUrl('')}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex-1 max-w-md">
                    <Input
                      label="Hashtags (comma-separated)"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="ProudlyPlaced, ParulUniversity, Google, SDE"
                    />
                  </div>
                  <Button type="submit" size="md" isLoading={createPostMutation.isPending} leftIcon={<Send className="w-4 h-4" />}>
                    Publish Post
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: 'All Updates', value: 'ALL' },
            { label: 'Placement Stories (#ProudlyPlaced)', value: 'PLACEMENT_STORY' },
            { label: 'Official Announcements', value: 'ANNOUNCEMENT' },
            { label: 'Interview Experiences', value: 'INTERVIEW_EXPERIENCE' },
            { label: 'Career Advice', value: 'CAREER_ADVICE' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-[#172554] text-white shadow-xs font-bold'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-[#FAF8F5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Grid: Feed Posts (Left) + Top Opportunities Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Pinned Spotlight Posts */}
            {pinnedPosts.length > 0 && (
              <div className="space-y-6">
                {pinnedPosts.map((post) => (
                  <Card key={post.id} className="border-brand-300 shadow-md overflow-hidden bg-white">
                    {/* LinkedIn Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-brand-50/50 to-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm border border-blue-800">
                          PU
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">
                              {post.author.managerProfile?.fullName || 'Parul University Placement Cell'}
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-100 shrink-0" />
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              NAAC A++
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>Training & Placement Cell</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-md">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                        <Badge variant="purple">{post.postType.replace('_', ' ')}</Badge>
                      </div>
                    </div>

                    <CardBody className="p-4 sm:p-5 space-y-4">
                      {/* Post Text */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Photo Attachment (Parul University LinkedIn Style) */}
                      {post.imageUrl && (
                        <div
                          onClick={() => setActiveLightboxImage(post.imageUrl!)}
                          className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-950 group cursor-pointer shadow-sm"
                        >
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full max-h-[440px] object-cover object-top group-hover:scale-[1.01] transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            #ProudlyPlaced • Parul University
                          </div>
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] px-2.5 py-1 rounded-lg backdrop-blur-sm">
                            Click to View Full Size
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* LinkedIn Action Bar */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => toggleLikeMutation.mutate(post.id)}
                            className="flex items-center gap-1.5 hover:text-brand-600 font-semibold transition-colors"
                          >
                            <ThumbsUp className="w-4 h-4 text-brand-600" />
                            <span>{post._count?.likes || 0} Likes</span>
                          </button>
                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className="flex items-center gap-1.5 hover:text-brand-600 font-semibold transition-colors"
                          >
                            <MessageSquare className="w-4 h-4 text-slate-500" />
                            <span>{post._count?.comments || 0} Comments</span>
                          </button>
                          <button
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-1.5 hover:text-brand-600 font-semibold transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-slate-500" />
                            <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                          </button>
                        </div>
                        <button
                          onClick={() => feedApi.reportPost(post.id)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                          title="Report post"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Comments Drawer */}
                      {expandedComments[post.id] && (
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ''}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="Write a congratulatory message or ask a question..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            />
                            <Button size="sm" type="submit" isLoading={addCommentMutation.isPending}>
                              Comment
                            </Button>
                          </form>

                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="p-3 rounded-xl bg-slate-50 text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-800">
                                      {comment.author.studentProfile?.fullName || 'Community Member'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-slate-600">{comment.content}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {/* Regular Posts List */}
            {loadingPosts ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
              </div>
            ) : regularPosts.length === 0 && pinnedPosts.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-6 h-6" />}
                title="No Posts in this Category"
                description="Be the first to share an interview experience or ask questions in this channel."
                actionLabel="Create a Post"
                onAction={() => setIsComposerOpen(true)}
              />
            ) : (
              regularPosts.map((post) => (
                <Card key={post.id} className="shadow-sm hover:border-slate-300 transition-all overflow-hidden bg-white">
                  {/* LinkedIn Style Post Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                        {(
                          post.author.studentProfile?.fullName ||
                          post.author.alumniProfile?.fullName ||
                          post.author.managerProfile?.fullName ||
                          'PU'
                        )[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {post.author.studentProfile?.fullName ||
                              post.author.alumniProfile?.fullName ||
                              post.author.managerProfile?.fullName ||
                              'Parul University Member'}
                          </span>
                          {post.author.alumniProfile?.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>
                            {post.author.alumniProfile?.currentCompany
                              ? `Alumnus at ${post.author.alumniProfile.currentCompany}`
                              : post.author.studentProfile?.department
                              ? `${post.author.studentProfile.department} Student`
                              : 'Corporate Relations & Placement Cell'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge variant="default">{post.postType.replace('_', ' ')}</Badge>
                  </div>

                  <CardBody className="p-4 sm:p-5 space-y-4">
                    {/* Post Content */}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug">
                        {post.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Image Media (Parul University LinkedIn Photo) */}
                    {post.imageUrl && (
                      <div
                        onClick={() => setActiveLightboxImage(post.imageUrl!)}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group cursor-pointer shadow-sm"
                      >
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full max-h-[460px] object-cover object-top group-hover:scale-[1.01] transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-white/20 flex items-center gap-1.5 shadow">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          #ProudlyPlaced • Parul University
                        </div>
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 text-white text-[11px] px-2.5 py-1 rounded-lg backdrop-blur-sm">
                          Click to Enlarge
                        </div>
                      </div>
                    )}

                    {/* Hashtags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* LinkedIn Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => toggleLikeMutation.mutate(post.id)}
                          className="flex items-center gap-1.5 hover:text-brand-600 font-semibold transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4 text-brand-600" />
                          <span>{post._count?.likes || 0} Likes</span>
                        </button>
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className="flex items-center gap-1.5 hover:text-brand-600 font-semibold transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          <span>{post._count?.comments || 0} Comments</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center gap-1.5 hover:text-brand-600 font-semibold transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-slate-500" />
                          <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => feedApi.reportPost(post.id)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="Report inappropriate content"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {expandedComments[post.id] && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            placeholder="Write a congratulatory note or feedback..."
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          />
                          <Button size="sm" type="submit" isLoading={addCommentMutation.isPending}>
                            Comment
                          </Button>
                        </form>

                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="p-3 rounded-xl bg-slate-50 text-xs">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-slate-800">
                                    {comment.author.studentProfile?.fullName ||
                                      comment.author.alumniProfile?.fullName ||
                                      'Member'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          {/* Right Column: Parul LinkedIn Hub & Open Opportunities */}
          <div className="space-y-6">
            {/* Parul University Placement Records Card */}
            <Card className="border-brand-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">#ProudlyPlaced Records</h4>
                </div>
                <h3 className="text-sm font-bold text-white">Parul University Placement Cell</h3>
                <p className="text-[11px] text-blue-200 mt-0.5">Vadodara, Gujarat • NAAC Grade A++</p>
              </div>
              <CardBody className="p-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Placed</p>
                    <p className="text-base font-extrabold text-blue-900">20,000+</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Recruiters</p>
                    <p className="text-base font-extrabold text-brand-600">2,200+</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Highest CTC</p>
                    <p className="text-base font-extrabold text-amber-600">44+ LPA</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase">Avg Package</p>
                    <p className="text-base font-extrabold text-emerald-600">8.2 LPA</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-700 mb-2">Key Hiring Partners:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture', 'Capgemini', 'HCL'].map(
                      (company) => (
                        <span
                          key={company}
                          className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200/60 px-2 py-0.5 rounded-md"
                        >
                          {company}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <a
                  href="https://www.linkedin.com/school/parul-university/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-1.5 w-full bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Follow Parul University on LinkedIn
                </a>
              </CardBody>
            </Card>

            {/* Open Drives Sidebar */}
            <Card>
              <CardHeader
                title="Active Recruitment Drives"
                subtitle="Apply before deadline expires"
                action={
                  <Link to="/opportunities" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                    All &rarr;
                  </Link>
                }
              />
              <CardBody className="p-0">
                {sidebarOpps.length === 0 ? (
                  <p className="text-xs text-slate-400 p-5 text-center">No open opportunities</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sidebarOpps.map((opp) => (
                      <div key={opp.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded uppercase">
                          {opp.company?.name}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{opp.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </p>
                        <div className="mt-2.5 flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-800">
                            {opp.salaryMin ? `₹${(opp.salaryMin / 100000).toFixed(1)} LPA` : 'Competitive'}
                          </span>
                          <Link to="/opportunities">
                            <span className="text-xs font-semibold text-brand-600 hover:underline">Apply &rarr;</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Motivational Alumni CTA */}
            <Card className="bg-gradient-to-tr from-brand-900 to-indigo-900 text-white border-0">
              <CardBody className="p-6 space-y-3">
                <Sparkles className="w-6 h-6 text-brand-300" />
                <h4 className="text-sm font-bold">Have an interview story to share?</h4>
                <p className="text-xs text-brand-200/90 leading-relaxed">
                  Inspire your fellow students by sharing your interview rounds, technical challenges, and placement preparation tips.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setIsComposerOpen(true);
                    setNewPostType('INTERVIEW_EXPERIENCE');
                  }}
                  className="w-full mt-2"
                >
                  Write Placement Story
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Resolution Photo Viewing */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeLightboxImage}
              alt="Enlarged placement poster"
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            <div className="p-3 bg-slate-900/95 border-t border-white/10 text-center">
              <span className="text-xs font-bold text-amber-400">
                #ProudlyPlaced • Parul University NAAC Grade A++ Placement Showcase
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
