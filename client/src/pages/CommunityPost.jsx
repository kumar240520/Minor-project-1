import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, MessageCircle, Send, Trash2, Tag, Image, Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../supabaseClient';
import { getDisplayName, formatLocalRelativeTime } from '../utils/auth';
import {
  DashboardCard,
  DashboardButton,
  DashboardBadge,
  FeedbackState
} from '../components/dashboard';

const CommunityPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('Discussion');
  const [isPosting, setIsPosting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [replyContent, setReplyContent] = useState({});
  const [isReplying, setIsReplying] = useState({});
  const [userLikes, setUserLikes] = useState(new Set());

  const availableTags = ['Discussion', 'Study Group', 'PYQs', 'Notes', 'Campus Event', 'Career'];

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', table: 'community_posts', schema: 'public' },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching posts:', error);
        setPosts([]);
      } else {
        setPosts(data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser || isPosting) return;

    setIsPosting(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const postData = {
        user_id: user.id,
        author_name: getDisplayName(user, 'Anonymous Student'),
        author_role: 'Student',
        author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        content: newPostContent.trim(),
        tags: [selectedTag],
        likes: 0,
        replies: 0
      };

      const { data, error } = await supabase
        .from('community_posts')
        .insert([postData])
        .select();

      if (error) throw error;

      setNewPostContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to submit post.');
    } finally {
      setIsPosting(false);
    }
  };

  const toggleReplies = async (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      await fetchReplies(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const fetchReplies = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('community_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, replies_data: data || [] }
          : post
      ));
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleReply = async (postId) => {
    const content = replyContent[postId];
    if (!content?.trim() || !currentUser) return;

    setIsReplying(prev => ({ ...prev, [postId]: true }));

    try {
      const replyData = {
        post_id: postId,
        user_id: currentUser.id,
        author_name: getDisplayName(currentUser, 'Anonymous Student'),
        author_role: 'Student',
        author_avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
        content: content.trim(),
        likes: 0
      };

      const { error } = await supabase
        .from('community_replies')
        .insert([replyData]);

      if (error) throw error;

      setReplyContent(prev => ({ ...prev, [postId]: '' }));
      await fetchReplies(postId);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setIsReplying(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (id) => {
    const post = posts.find(p => p.id === id);
    if (post && post.author_role === 'admin') {
      alert('Committee posts cannot be deleted by students.');
      return;
    }

    if (!window.confirm("Delete this post?")) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      alert("Failed to delete post.");
    }
  };

  const handleLikePost = async (postId, currentLikes) => {
    if (!currentUser) {
      alert('Please log in to like posts');
      return;
    }

    const likeKey = `${postId}-${currentUser.id}`;
    const isLiked = userLikes.has(likeKey);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('community_posts')
          .update({ likes: Math.max(0, (currentLikes || 0) - 1) })
          .eq('id', postId);

        if (error) throw error;
        setUserLikes(prev => {
          const next = new Set(prev);
          next.delete(likeKey);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('community_posts')
          .update({ likes: (currentLikes || 0) + 1 })
          .eq('id', postId);

        if (error) throw error;
        setUserLikes(prev => new Set([...prev, likeKey]));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like');
    }
  };

  return (
    <Layout
      title="Community Hub"
      subtitle="Engage with peers, share academic insights, and discuss subjects"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* New Post Card */}
        <DashboardCard className="p-5 sm:p-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            <img
              src={currentUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}` : "https://i.pravatar.cc/150?u=12"}
              alt="Your Profile"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Ask a question, share an exam tip, or start a discussion..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] focus:bg-white dark:focus:bg-slate-950 transition-all resize-none"
                rows="3"
                disabled={isPosting}
              />

              {/* Tag selector chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-3 mb-4">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Tag:
                </span>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                      selectedTag === tag
                        ? 'bg-[#101A63] text-white shadow-sm dark:bg-[#2563EB]'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Keep conversations respectful & academic
                </div>
                <DashboardButton
                  variant="primary"
                  onClick={handleCreatePost}
                  disabled={isPosting || !newPostContent.trim()}
                  loading={isPosting}
                  icon={Send}
                >
                  Publish Post
                </DashboardButton>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <FeedbackState
              type="loading"
              title="Loading Community Feed"
              description="Fetching recent academic discussions and student questions..."
            />
          ) : posts.length === 0 ? (
            <FeedbackState
              type="empty"
              title="No Discussions Yet"
              description="Be the first student to spark a conversation in your campus community!"
              actionText="Write First Post"
              onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          ) : (
            posts.map((post, index) => {
              const postLikeKey = `${post.id}-${currentUser?.id}`;
              const isLiked = userLikes.has(postLikeKey);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <DashboardCard className="p-5 sm:p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    {/* Post Author Bar */}
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`}
                          alt={post.author_name}
                          className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                              {post.author_name}
                            </h3>
                            {post.author_role === 'admin' ? (
                              <DashboardBadge variant="warning">Committee</DashboardBadge>
                            ) : (
                              <DashboardBadge variant="neutral">Student</DashboardBadge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {formatLocalRelativeTime(post.created_at)}
                          </p>
                        </div>
                      </div>

                      {currentUser && currentUser.id === post.user_id && post.author_role !== 'admin' && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5 rounded-lg transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-3.5">
                      {post.content}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      <button
                        onClick={() => handleLikePost(post.id, post.likes)}
                        className={`flex items-center gap-1.5 font-medium transition-colors ${
                          isLiked
                            ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                            : 'hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes || 0} Likes</span>
                      </button>

                      <button
                        onClick={() => toggleReplies(post.id)}
                        className="flex items-center gap-1.5 font-medium hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.replies_data?.length || post.replies || 0} Replies</span>
                      </button>
                    </div>

                    {/* Replies Panel */}
                    <AnimatePresence>
                      {expandedPosts.has(post.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-3 space-y-3"
                        >
                          {/* Input */}
                          <div className="flex items-start gap-2.5">
                            <img
                              src={currentUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}` : "https://i.pravatar.cc/150?u=12"}
                              alt="Your avatar"
                              className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mt-1 shrink-0"
                            />
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={replyContent[post.id] || ''}
                                onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Write a response..."
                                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white dark:focus:bg-slate-950 transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && handleReply(post.id)}
                                disabled={isReplying[post.id]}
                              />
                              <button
                                onClick={() => handleReply(post.id)}
                                disabled={!replyContent[post.id]?.trim() || isReplying[post.id]}
                                className="px-3 py-1.5 bg-[#101A63] dark:bg-[#2563EB] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
                              >
                                {isReplying[post.id] ? (
                                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <Send className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Existing Replies List */}
                          {post.replies_data && post.replies_data.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {post.replies_data.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-start gap-2.5 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60"
                                >
                                  <img
                                    src={reply.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user_id}`}
                                    alt={reply.author_name}
                                    className="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-medium text-xs text-slate-900 dark:text-slate-100">
                                        {reply.author_name}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {formatLocalRelativeTime(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </DashboardCard>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </Layout>
  );
};

export default CommunityPost;
