import React, { useState, useEffect } from 'react';
import { Search, Bell, MessageSquare, ThumbsUp, MessageCircle, Send, Trash2, Plus, Edit, Eye, Users } from 'lucide-react';
import ResponsiveAdminSidebar from '../../components/admin/ResponsiveAdminSidebar';
import ResponsiveAdminHeader from '../../components/admin/ResponsiveAdminHeader';
import { supabase } from '../../supabaseClient';

const AdminCommitteePosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // New committee post state
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchPosts();

        // Realtime subscription
        const channel = supabase
            .channel('admin-committee-posts')
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

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('community_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching posts:', error);
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

    const handleCreateCommitteePost = async () => {
        if (!newPostTitle.trim() || !newPostContent.trim() || isPosting) return;

        setIsPosting(true);
        try {
            // Get current user when creating post
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                throw new Error('User not authenticated');
            }

            const postData = {
                user_id: user.id,
                author_name: 'Admin',
                author_role: 'admin',
                content: `${newPostTitle.trim()}\n\n${newPostContent.trim()}`,
                likes: 0,
                replies: 0
            };

            const { data, error } = await supabase
                .from('community_posts')
                .insert([postData])
                .select();

            if (error) {
                throw error;
            }

            // Reset form
            setNewPostTitle('');
            setNewPostContent('');
            setShowCreateForm(false);
            
            // Show success message
            alert('Committee post published successfully!');
            
            // Refresh posts
            fetchPosts();
        } catch (error) {
            console.error('Error creating committee post:', error);
            alert(`Failed to create committee post: ${error.message || 'Unknown error'}`);
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            const { error } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (error) {
                throw error;
            }

            // Refresh posts
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        }
    };

    // Filter posts based on search term
    const filteredPosts = posts.filter(post => 
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            <ResponsiveAdminSidebar />

            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <ResponsiveAdminHeader
                    title="Committee Posts"
                    subtitle="Create official committee announcements for all users"
                    onMobileMenuToggle={() => {}}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Create Committee Post Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Create Committee Post</span>
                            </button>
                        </div>

                        {/* Create Committee Post Form */}
                        {showCreateForm && (
                            <div
                                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Committee Post Title</label>
                                        <input
                                            type="text"
                                            value={newPostTitle}
                                            onChange={(e) => setNewPostTitle(e.target.value)}
                                            placeholder="Enter committee announcement title..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                                        <textarea
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            placeholder="Write your official committee announcement..."
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleCreateCommitteePost}
                                            disabled={isPosting || !newPostTitle.trim() || !newPostContent.trim()}
                                            className="flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="h-4 w-4" />
                                            <span>{isPosting ? 'Publishing...' : 'Publish Committee Post'}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setNewPostTitle('');
                                                setNewPostContent('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search committee posts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Posts List */}
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                        <div className="animate-pulse">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                            <div className="flex items-center space-x-4 mt-4">
                                                <div className="h-4 w-8 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-8 bg-gray-200 rounded"></div>
                                                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? 'No posts found' : 'No committee posts yet'}
                                </h3>
                                <p className="text-gray-600">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first committee announcement to get started'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {filteredPosts.map((post) => {
                                        // Split title and content from combined field
                                        const contentParts = post.content.split('\n\n');
                                        const title = contentParts[0] || '';
                                        const content = contentParts.slice(1).join('\n\n') || '';
                                        
                                        return (
                                            <div
                                                key={post.id}
                                                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                post.author_role === 'admin' 
                                                                    ? 'bg-red-100 text-red-800' 
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {post.author_role === 'admin' ? 'Admin' : 'Student'}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(post.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        
                                                        {title && (
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                                {title}
                                                            </h3>
                                                        )}
                                                        
                                                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                                                            {content}
                                                        </p>
                                                        
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <ThumbsUp className="h-4 w-4" />
                                                                <span>{post.likes || 0}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <MessageCircle className="h-4 w-4" />
                                                                <span>{post.replies || 0}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Eye className="h-4 w-4" />
                                                                <span>{post.author_role === 'admin' ? 'All users can view' : 'Users can view'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-4">
                                                        <button
                                                            onClick={() => handleDeletePost(post.id)}
                                                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Delete Post"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminCommitteePosts;
