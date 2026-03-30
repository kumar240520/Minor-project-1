import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, MessageSquare, ThumbsUp, MessageCircle, Send, Trash2 } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';
import { getDisplayName, formatLocalRelativeTime } from '../utils/auth';

const CommunityPost = () => {
    const [posts, setPosts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    // New post state
    const [newPostContent, setNewPostContent] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);

    // Current user state (to determine delete permissions)
    const [currentUser, setCurrentUser] = React.useState(null);

    // Replies state
    const [expandedPosts, setExpandedPosts] = React.useState(new Set());
    const [replyContent, setReplyContent] = React.useState({});
    const [isReplying, setIsReplying] = React.useState({});
    const [userLikes, setUserLikes] = React.useState(new Set());

    React.useEffect(() => {
        fetchCurrentUser();
        fetchPosts();

        // REALTIME SUBSCRIPTION
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                { event: '*', table: 'community_posts', schema: 'public' },
                () => {
                    fetchPosts(); // Refresh list when any change happens
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
                
                // More specific error handling
                if (error.message.includes('relation "community_posts" does not exist')) {
                    console.error('Community posts table not found. Please run the SQL setup scripts.');
                    setPosts([]);
                } else if (error.message.includes('permission denied')) {
                    console.error('Permission denied accessing community posts.');
                    setPosts([]);
                } else {
                    throw error;
                }
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
            // Check if user is authenticated
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
                tags: ['Discussion'],
                likes: 0,
                replies: 0
            };

            console.log('Creating post with data:', postData);

            const { data, error } = await supabase
                .from('community_posts')
                .insert([postData])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Post created successfully:', data);
            setNewPostContent('');
            
            // Show success message
            alert('Post published successfully!');
            
        } catch (error) {
            console.error('Error creating post:', error);
            
            // More specific error messages
            let errorMessage = 'Failed to submit post.';
            if (error.message.includes('relation "community_posts" does not exist')) {
                errorMessage = 'Community posts table not found. Please contact administrator to set up the database.';
            } else if (error.message.includes('permission denied')) {
                errorMessage = 'Permission denied. You may not have posting privileges.';
            } else if (error.message.includes('not authenticated')) {
                errorMessage = 'Authentication error. Please log in again.';
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }
            
            alert(errorMessage);
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
            // Fetch replies when expanding
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

            // Clear reply input and refresh replies
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
        // Find the post to check if it's a committee post
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
            // UI update handled by Realtime
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
                // Unlike the post
                const { error } = await supabase
                    .from('community_posts')
                    .update({ likes: Math.max(0, (currentLikes || 0) - 1) })
                    .eq('id', postId);
                
                if (error) throw error;
                setUserLikes(prev => {
                    const newLikes = new Set(prev);
                    newLikes.delete(likeKey);
                    return newLikes;
                });
            } else {
                // Like the post
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
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
                    <ResponsiveHeader 
                        title="Community"
                        showSearch={true}
                        showNotifications={true}
                        showProfile={true}
                    />

                <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/50">
                    <div className="max-w-4xl mx-auto space-y-6">
                        
                        {/* New Post Input */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start space-x-4">
                            <img src={currentUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}` : "https://i.pravatar.cc/150?u=12"} alt="Your Profile" className="h-12 w-12 rounded-full border border-gray-200" />
                            <div className="flex-1">
                                <textarea 
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Got a question or something to share?"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors resize-none mb-4"
                                    rows="3"
                                    disabled={isPosting}
                                ></textarea>
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <button className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Add Tag</button>
                                        <button className="text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Attach Image</button>
                                    </div>
                                    <button 
                                        onClick={handleCreatePost}
                                        disabled={isPosting || !newPostContent.trim()}
                                        className={`px-6 py-2 rounded-xl font-bold flex items-center shadow-sm transition-colors ${isPosting || !newPostContent.trim() ? 'bg-violet-400 text-white cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                                    >
                                        {isPosting ? 'Posting...' : <>Post <Send className="h-4 w-4 ml-2" /></>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-6">
                            {loading ? (
                                <div className="text-center py-12 text-gray-500">Loading community discussions...</div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">No discussions yet. Start one!</div>
                            ) : posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <img src={post.author_avatar} alt={post.author_name} className="h-12 w-12 rounded-full border border-gray-200" />
                                            <div>
                                                <h3 className="font-bold text-gray-800">{post.author_name}</h3>
                                                <p className="text-xs text-gray-500">{post.author_role} • {formatLocalRelativeTime(post.created_at)}</p>
                                            </div>
                                        </div>
                                        {currentUser && currentUser.id === post.user_id && post.author_role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                title="Delete Post"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <p className="text-gray-700 leading-relaxed mb-4">
                                        {post.content}
                                    </p>
                                    
                                    <div className="flex space-x-2 mb-6">
                                        {post.tags && post.tags.map(tag => (
                                            <span key={tag} className="text-xs font-semibold bg-violet-50 text-violet-700 px-3 py-1 rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 text-gray-500">
                                        <button 
                                            onClick={() => handleLikePost(post.id, post.likes)}
                                            className={`flex items-center space-x-2 transition-colors font-medium text-sm ${
                                                userLikes.has(`${post.id}-${currentUser?.id}`) 
                                                    ? 'text-violet-600' 
                                                    : 'hover:text-violet-600'
                                            }`}
                                        >
                                            <ThumbsUp className={`h-5 w-5 ${userLikes.has(`${post.id}-${currentUser?.id}`) ? 'fill-current' : ''}`} />
                                            <span>{post.likes || 0} Likes</span>
                                        </button>
                                        <button 
                                            onClick={() => toggleReplies(post.id)}
                                            className="flex items-center space-x-2 hover:text-violet-600 transition-colors font-medium text-sm"
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            <span>{post.replies || 0} Replies</span>
                                        </button>
                                    </div>

                                    {/* Replies Section */}
                                    {expandedPosts.has(post.id) && (
                                        <div className="border-t border-gray-100 pt-4 mt-4">
                                            {/* Reply Input */}
                                            <div className="flex items-start space-x-3 mb-4">
                                                <img 
                                                    src={currentUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}` : "https://i.pravatar.cc/150?u=12"} 
                                                    alt="Your Profile" 
                                                    className="h-8 w-8 rounded-full border border-gray-200" 
                                                />
                                                <div className="flex-1 flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={replyContent[post.id] || ''}
                                                        onChange={(e) => setReplyContent(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                        placeholder="Write a reply..."
                                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
                                                        onKeyPress={(e) => e.key === 'Enter' && handleReply(post.id)}
                                                        disabled={isReplying[post.id]}
                                                    />
                                                    <button
                                                        onClick={() => handleReply(post.id)}
                                                        disabled={!replyContent[post.id]?.trim() || isReplying[post.id]}
                                                        className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition-colors flex items-center"
                                                    >
                                                        {isReplying[post.id] ? (
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        ) : (
                                                            <Send className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Replies List */}
                                            {post.replies_data && post.replies_data.length > 0 && (
                                                <div className="space-y-3">
                                                    {post.replies_data.map((reply) => (
                                                        <div key={reply.id} className="flex items-start space-x-3 bg-gray-50 rounded-lg p-3">
                                                            <img 
                                                                src={reply.author_avatar} 
                                                                alt={reply.author_name} 
                                                                className="h-8 w-8 rounded-full border border-gray-200" 
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <span className="font-semibold text-sm text-gray-800">{reply.author_name}</span>
                                                                    <span className="text-xs text-gray-500">{reply.author_role}</span>
                                                                    <span className="text-xs text-gray-400">
                                                                        {formatLocalRelativeTime(reply.created_at)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 leading-relaxed">{reply.content}</p>
                                                                <div className="flex items-center space-x-4 mt-2 text-gray-500">
                                                                    <button className="flex items-center space-x-1 text-xs hover:text-violet-600 transition-colors">
                                                                        <ThumbsUp className="h-3 w-3" />
                                                                        <span>{reply.likes || 0}</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            </div>
        </SidebarProvider>
    );
};

export default CommunityPost;
