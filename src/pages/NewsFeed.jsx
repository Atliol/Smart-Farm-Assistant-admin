import React, { useState, useEffect, memo } from 'react';
import { db } from '../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

// 💬 Sub-component: Replies List (Dynamic Data from Firebase)
const RepliesList = memo(({ postId, commentId }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchReplies = async () => {
            try {
                const repliesRef = collection(db, 'posts', postId, 'comments', commentId, 'replies');
                const q = query(repliesRef, orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);

                if (isMounted) {
                    const tempReplies = querySnapshot.docs.map(docSnap => ({
                        id: docSnap.id,
                        ...docSnap.data()
                    }));
                    setReplies(tempReplies);
                }
            } catch (err) {
                console.error("Error fetching replies: ", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchReplies();
        return () => { isMounted = false; };
    }, [postId, commentId]);

    if (loading || replies.length === 0) return null;

    return (
        <div className="ms-4 ps-3 border-start border-light-subtle mt-2">
            {replies.map(reply => (
                <div className="d-flex align-items-start gap-2 mb-2" key={reply.id}>
                    {/* Profile Image for Replies */}
                    {reply.userProfileImage ? (
                        <img src={reply.userProfileImage} alt="Profile" className="rounded-circle object-fit-cover" style={{ width: '28px', height: '28px', flexShrink: 0 }} />
                    ) : (
                        <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold border border-success border-opacity-10" style={{ width: '28px', height: '28px', fontSize: '11px', flexShrink: 0 }}>
                            {(reply.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    <div className="flex-grow-1">
                        <div className="bg-light rounded-4 px-3 py-1.5 d-inline-block" style={{ maxWidth: '100%' }}>
                            <div className="d-flex align-items-center gap-1.5">
                                <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{reply.userName || 'Anonymous'}</span>
                                <span className="text-muted" style={{ fontSize: '10px' }}>
                                    <i className="bi bi-reply-fill text-secondary me-0.5"></i> replied
                                </span>
                            </div>
                            <div className="text-dark mt-0.5" style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{reply.comment}</div>
                        </div>
                        {reply.commentImageUrl && (
                            <div className="mt-1 rounded-3 overflow-hidden border d-inline-block" style={{ maxWidth: '150px' }}>
                                <img src={reply.commentImageUrl} className="img-fluid" alt="reply-attachment" style={{ maxHeight: '100px', cursor: 'zoom-in' }} onClick={() => window.open(reply.commentImageUrl, '_blank')} />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
});

// 💬 Sub-component: Comment Item
const CommentItem = memo(({ postId, comment }) => {
    return (
        <div className="mb-3">
            <div className="d-flex align-items-start gap-2">
                {/* Profile Image for Comments */}
                {comment.userProfileImage ? (
                    <img src={comment.userProfileImage} alt="Profile" className="rounded-circle object-fit-cover" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
                ) : (
                    <div className="rounded-circle bg-light text-secondary d-flex align-items-center justify-content-center fw-bold border" style={{ width: '32px', height: '32px', fontSize: '12px', flexShrink: 0 }}>
                        {(comment.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                )}
                
                <div className="flex-grow-1">
                    <div className="bg-light rounded-4 px-3 py-2 d-inline-block" style={{ maxWidth: '100%' }}>
                        <div className="fw-bold text-dark" style={{ fontSize: '13px' }}>{comment.userName || 'Anonymous'}</div>
                        <div className="text-dark mt-0.5" style={{ fontSize: '13.5px', whiteSpace: 'pre-wrap' }}>{comment.comment}</div>
                    </div>
                    {comment.commentImageUrl && (
                        <div className="mt-1 rounded-3 overflow-hidden border d-inline-block" style={{ maxWidth: '200px' }}>
                            <img src={comment.commentImageUrl} className="img-fluid" alt="comment-attachment" style={{ maxHeight: '150px', cursor: 'zoom-in' }} onClick={() => window.open(comment.commentImageUrl, '_blank')} />
                        </div>
                    )}
                    <div className="ps-2 mt-1" style={{ fontSize: '11px' }}>
                        <span className="text-muted">
                            {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                    </div>
                </div>
            </div>
            <RepliesList postId={postId} commentId={comment.id} />
        </div>
    );
});

// 💬 Sub-component: PostComments Container (Dynamic Data from Firebase)
const PostComments = memo(({ postId }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchComments = async () => {
            try {
                const commentsRef = collection(db, 'posts', postId, 'comments');
                const q = query(commentsRef, orderBy('createdAt', 'asc'));
                const querySnapshot = await getDocs(q);

                if (isMounted) {
                    const tempComments = querySnapshot.docs.map(docSnap => ({
                        id: docSnap.id,
                        ...docSnap.data()
                    }));
                    setComments(tempComments);
                }
            } catch (err) {
                console.error("Error fetching comments: ", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchComments();
        return () => { isMounted = false; };
    }, [postId]);

    if (loading) return <div className="text-center py-2"><div className="spinner-border spinner-border-sm text-success"></div></div>;

    return (
        <div className="mt-3 ps-2 border-start border-2 border-light-subtle">
            {comments.length === 0 ? (
                <p className="text-muted small ps-2">ဆွေးနွေးမှုများ မရှိသေးပါ။</p>
            ) : (
                comments.map(comment => (
                    <CommentItem 
                        key={comment.id} 
                        postId={postId}
                        comment={comment} 
                    />
                ))
            )}
        </div>
    );
});

// 🏠 Main Page Component: NewsFeed
const NewsFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDiscussions, setExpandedDiscussions] = useState({});
    
    // Title Filtering State
    const [selectedTitle, setSelectedTitle] = useState('All');

    // Search Query State
    const [searchTerm, setSearchTerm] = useState('');

    // Dynamic Posts Fetching from Firebase Firestore
    useEffect(() => {
        let isMounted = true;
        const fetchPosts = async () => {
            try {
                const postsRef = collection(db, 'posts');
                const q = query(postsRef, limit(15));
                const querySnapshot = await getDocs(q);

                if (isMounted) {
                    const tempPosts = querySnapshot.docs.map((docSnap) => ({
                        id: docSnap.id,
                        ...docSnap.data()
                    }));

                    tempPosts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    setPosts(tempPosts);
                }
            } catch (error) {
                console.error("Error fetching posts: ", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPosts();
        return () => { isMounted = false; };
    }, []);

    const toggleDiscussion = (postId) => {
        setExpandedDiscussions(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const getPostImages = (post) => {
        let list = [];
        if (post.imageUrl && post.imageUrl.trim() !== '') list.push(post.imageUrl);
        if (Array.isArray(post.imageUrls)) {
            post.imageUrls.forEach(url => {
                if (url && url.trim() !== '' && !list.includes(url)) list.push(url);
            });
        }
        return list;
    };

    // Extract Unique Titles for Filters
    const uniqueTitles = ['All', ...new Set(posts.map(post => post.title).filter(title => title && title.trim() !== ''))];
    
    // Filter Posts by Selected Title & Search Keyword
    const filteredPosts = posts.filter(post => {
        const matchesTitle = selectedTitle === 'All' || post.title === selectedTitle;
        
        const search = searchTerm.toLowerCase().trim();
        const matchesSearch = !search || 
            (post.title && post.title.toLowerCase().includes(search)) ||
            (post.content && post.content.toLowerCase().includes(search)) ||
            (post.userName && post.userName.toLowerCase().includes(search));

        return matchesTitle && matchesSearch;
    });

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Static Element: Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="col-md-10 offset-md-2 p-4" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
                    
                    {/* Header Top Bar */}
                    <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm">
                        <h4 className="fw-bold m-0 text-dark">News Feed</h4>
                        <div className="d-flex align-items-center gap-3">
                            <div className="input-group" style={{ width: '300px' }}>
                                <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search"></i></span>
                                <input 
                                    type="text" 
                                    className="form-control bg-light border-start-0" 
                                    placeholder="Search posts..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button 
                                        className="btn btn-light border-start-0 text-muted" 
                                        type="button" 
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Title Filters */}
                    <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
                        {uniqueTitles.map(title => (
                            <button 
                                key={title}
                                onClick={() => setSelectedTitle(title)}
                                className={`btn rounded-pill px-4 btn-sm fw-semibold border ${selectedTitle === title ? 'btn-success text-white' : 'btn-light text-muted'}`}
                            >
                                {title}
                            </button>
                        ))}
                    </div>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success" role="status"></div>
                        </div>
                    )}

                    {/* Empty Posts View */}
                    {!loading && filteredPosts.length === 0 && (
                        <div className="alert alert-light border text-center py-5 rounded-4 shadow-sm mx-auto" style={{ maxWidth: '680px' }}>
                            <i className="bi bi-mailbox fs-1 text-muted d-block mb-2"></i>
                            <span className="text-muted">
                                {searchTerm ? `"${searchTerm}" နှင့် သက်ဆိုင်သော ပို့စ်မတွေ့ပါ၊` : 'လတ်တလော မည်သည့် ပို့စ်မျှ တင်ထားခြင်းမရှိသေးပါ။'}
                            </span>
                        </div>
                    )}

                    {/* Single Column Feed Container Centered */}
                    <div className="d-flex flex-column align-items-center gap-4">
                        {filteredPosts.map((post) => {
                            const images = getPostImages(post);
                            const isDiscussionsOpen = !!expandedDiscussions[post.id];
                            const likesCount = post.likedBy ? (Array.isArray(post.likedBy) ? post.likedBy.length : Object.keys(post.likedBy).length) : 0;
                            
                            return (
                                <div className="w-100" style={{ maxWidth: '680px' }} key={post.id}>
                                    <div className="card border rounded-4 shadow-sm bg-white">
                                        <div className="card-body p-4 d-flex flex-column">
                                            
                                            {/* Header with Avatar */}
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    
                                                    {/* Profile Image Logic */}
                                                    {post.userProfileImage ? (
                                                        <img src={post.userProfileImage} alt="Profile" className="rounded-circle object-fit-cover shadow-sm" style={{ width: '50px', height: '50px' }} />
                                                    ) : (
                                                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm" style={{ width: '50px', height: '50px' }}>
                                                            {(post.userName || 'U').substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <h6 className="fw-bold text-dark m-0 d-flex align-items-center">
                                                            {post.userName || 'Unknown User'}
                                                        </h6>
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <small className="text-muted" style={{ fontSize: '12px' }}>
                                                                {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Body Content */}
                                            {post.title && <h6 className="fw-bold text-dark mb-2">{post.title}</h6>}
                                            <p className="card-text text-dark mb-3" style={{ fontSize: '14.5px', lineHeight: '1.6' }}>
                                                {post.content}
                                            </p>

                                            {/* Attached Images */}
                                            {images.length > 0 && (
                                                <div className="mb-3 w-100 rounded-3 overflow-hidden">
                                                    <img src={images[0]} alt="attachment" className="img-fluid w-100" style={{ maxHeight: '420px', objectFit: 'cover' }} />
                                                </div>
                                            )}

                                            <hr className="text-light-subtle my-3" />

                                            {/* 💬 Likes & Comments Toggle Section */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted small d-flex align-items-center gap-1">
                                                    <i className="bi bi-hand-thumbs-up-fill text-success"></i> {likesCount} Likes
                                                </span>
                                                <button className="btn btn-link btn-sm text-decoration-none text-secondary fw-bold d-flex align-items-center gap-1 p-0" onClick={() => toggleDiscussion(post.id)}>
                                                    <i className="bi bi-chat-left-dots"></i> 
                                                    {isDiscussionsOpen ? 'Hide Discussions' : 'View Discussions'}
                                                </button>
                                            </div>

                                            {/* Expanded Discussions */}
                                            {isDiscussionsOpen && (
                                                <div className="mt-3 bg-light p-3 rounded-3">
                                                    <PostComments postId={post.id} />
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsFeed;