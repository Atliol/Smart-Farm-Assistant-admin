import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    limit, 
    getCountFromServer,
    Timestamp 
} from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

import cowImg from '../assets/cow_happiness.jpg'; 
import potatoImg from '../assets/spud_tacular.jpg'; 

const Dashboard = () => {
    const navigate = useNavigate();

    // Dynamic Stats State
    const [stats, setStats] = useState({
        users: { total: 0, growth: 0 },
        posts: { total: 0, growth: 0 },
        reports: { total: 0, newCount: 0 }
    });

    const [activities, setActivities] = useState([]);
    const [loadingCounts, setLoadingCounts] = useState(true);
    const [loadingActivities, setLoadingActivities] = useState(true);

    // Weather State
    const [weather, setWeather] = useState({ temp: null, city: '', description: '', loading: true });
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOnline, setIsOnline] = useState(true);

    // Fetch Weather Data
    const fetchWeather = async () => {
        try {
            const apiKey = '8fb8375cbf17fed6233ab87c6af52244'; 
            const city = 'Meiktila';
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
            const data = await res.json();

            if (res.ok) {
                setWeather({
                    temp: Math.round(data.main.temp),
                    city: data.name,
                    description: data.weather[0]?.main || '',
                    loading: false
                });
            } else {
                setWeather((prev) => ({ ...prev, loading: false }));
            }
        } catch (err) {
            console.error("Error fetching weather:", err);
            setWeather((prev) => ({ ...prev, loading: false }));
        }
    };

    // Helper: Calculate Percentage Growth safely
    const calculateGrowth = (total, lastWeekCount) => {
        if (!total || total === 0) return 0;
        if (!lastWeekCount || lastWeekCount === 0) return 100; // ပြီးခဲ့တဲ့အပတ်က 0 ဖြစ်နေရင် 100% တိုးတက်မှုအဖြစ် သတ်မှတ်
        
        const previousTotal = total - lastWeekCount; // ယခင်ပတ်က ရှိခဲ့သော စုစုပေါင်း
        if (previousTotal <= 0) return 100;

        const growth = ((lastWeekCount) / previousTotal) * 100;
        return Number(growth.toFixed(1));
    };

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        fetchWeather();

        // Optimized Dynamic Firebase Fetching
        const fetchDynamicCounts = async () => {
            try {
                // ရက်သတ္တပတ် (၇ ရက်) စာ ကြားကာလ သတ်မှတ်ခြင်း
                const now = new Date();
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const timestampSevenDaysAgo = Timestamp.fromDate(sevenDaysAgo);

                // Collections Reference
                const usersColl = collection(db, 'users');
                const postsColl = collection(db, 'posts');
                const reportsColl = collection(db, 'reports');

                // Last 7 Days Queries
                const newUsersQuery = query(usersColl, where('createdAt', '>=', timestampSevenDaysAgo));
                const newPostsQuery = query(postsColl, where('createdAt', '>=', timestampSevenDaysAgo));
                
                // Reports Queries
                const pendingReportsQuery = query(reportsColl, where('status', '==', 'pending'));
                const newReportsQuery = query(reportsColl, where('status', '==', 'pending'), where('createdAt', '>=', timestampSevenDaysAgo));

                // Parallel Call ကို သုံးပြီး တစ်ပြိုင်နက် Fetch လုပ်ခြင်း (Performance ကောင်းစေရန်)
                const [
                    totalUsersSnap, 
                    newUsersSnap, 
                    totalPostsSnap, 
                    newPostsSnap,
                    pendingReportsSnap,
                    newReportsSnap
                ] = await Promise.all([
                    getCountFromServer(usersColl),
                    getCountFromServer(newUsersQuery).catch(() => ({ data: () => ({ count: 0 }) })), // Catch error if missing index/field
                    getCountFromServer(postsColl),
                    getCountFromServer(newPostsQuery).catch(() => ({ data: () => ({ count: 0 }) })),
                    getCountFromServer(pendingReportsQuery).catch(() => ({ data: () => ({ count: 0 }) })),
                    getCountFromServer(newReportsQuery).catch(() => ({ data: () => ({ count: 0 }) }))
                ]);

                const totalUsers = totalUsersSnap.data().count;
                const newUsersThisWeek = newUsersSnap.data().count;

                const totalPosts = totalPostsSnap.data().count;
                const newPostsThisWeek = newPostsSnap.data().count;

                const pendingReports = pendingReportsSnap.data().count;
                const newReports = newReportsSnap.data().count;

                setStats({
                    users: {
                        total: totalUsers,
                        growth: calculateGrowth(totalUsers, newUsersThisWeek)
                    },
                    posts: {
                        total: totalPosts,
                        growth: calculateGrowth(totalPosts, newPostsThisWeek)
                    },
                    reports: {
                        total: pendingReports,
                        newCount: newReports
                    }
                });

            } catch (err) {
                console.error("Error fetching dynamic counts from Firestore:", err);
            } finally {
                setLoadingCounts(false);
            }
        };

        fetchDynamicCounts();

        // Fetch Recent Activity Notifications
        const qActivities = query(
            collection(db, 'notifications'), 
            orderBy('createdAt', 'desc'), 
            limit(5)
        );

        const unsubActivities = onSnapshot(qActivities, (snap) => {
            const data = [];
            let unread = 0;

            snap.forEach(doc => {
                const docData = doc.data();
                data.push({ id: doc.id, ...docData });
                if (docData.isRead === false) unread++;
            });

            setActivities(data);
            setUnreadCount(unread);
            setLoadingActivities(false);
        }, (err) => {
            console.error("Error loading activities:", err);
            setLoadingActivities(false);
        });

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            unsubActivities();
        };
    }, []);

    const handleNotificationClick = () => {
        setUnreadCount(0); 
        navigate('/notifications');
    };

    const renderActivityText = (act) => {
        if (act.message) return act.message;
        switch (act.type) {
            case 'post_like':
                return 'Liked a post';
            case 'post_comment':
                return 'Commented on a post';
            case 'report_post':
                return 'Reported a post';
            default:
                return 'System activity logged';
        }
    };

    return (
        <div className="container-fluid dashboard-wrapper">
            <style>{`
                .dashboard-wrapper {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background-color: #f8fafc;
                    min-height: 100vh;
                }
                .dashboard-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.02);
                    padding: 20px;
                }
                .stat-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .badge-status {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .badge-success-light { background-color: #dcfce7; color: #15803d; }
                .badge-danger-light { background-color: #fee2e2; color: #b91c1c; }
                
                .action-btn-outline {
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #334155;
                    border-radius: 10px;
                    padding: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .action-btn-outline:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
            `}</style>

            <div className="row">
                <Sidebar />

                <div className="col-md-10 offset-md-2 p-4">
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                        {/* TOP BAR */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h4 className="fw-bold m-0 text-dark">Shwe Lel Yar Admin</h4>

                            <div className="d-flex align-items-center gap-3">
                                <button className="btn btn-link text-secondary p-0 border-0 position-relative" onClick={handleNotificationClick}>
                                    <i className="bi bi-bell fs-5"></i>
                                    {unreadCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                                    )}
                                </button>
                                
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-secondary bg-opacity-10 rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                                        <i className="bi bi-person text-secondary fs-5"></i>
                                    </div>
                                    <span className="fw-semibold text-dark small">Admin</span>
                                </div>
                            </div>
                        </div>

                        {/* STAT CARDS */}
                        <div className="row g-3 mb-4">

                            {/* Users */}
                            <div className="col-12 col-sm-6 col-xl-3">
                                <div className="dashboard-card d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-medium">Total Active Users</span>
                                        <h3 className="fw-bold text-dark mt-2 mb-1">
                                            {loadingCounts ? '...' : stats.users.total.toLocaleString()}
                                        </h3>
                                        <span className={`small fw-medium ${stats.users.growth >= 0 ? 'text-success' : 'text-danger'}`}>
                                            <i className={`bi ${stats.users.growth >= 0 ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`}></i>
                                            {stats.users.growth >= 0 ? `+${stats.users.growth}%` : `${stats.users.growth}%`}{' '}
                                            <span className="text-muted font-normal">from last week</span>
                                        </span>
                                    </div>
                                    <div className="stat-icon bg-success bg-opacity-10 text-success">
                                        <i className="bi bi-people"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Posts */}
                            <div className="col-12 col-sm-6 col-xl-3">
                                <div className="dashboard-card d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-medium">Total Posts</span>
                                        <h3 className="fw-bold text-dark mt-2 mb-1">
                                            {loadingCounts ? '...' : stats.posts.total.toLocaleString()}
                                        </h3>
                                        <span className={`small fw-medium ${stats.posts.growth >= 0 ? 'text-success' : 'text-danger'}`}>
                                            <i className={`bi ${stats.posts.growth >= 0 ? 'bi-arrow-up-short' : 'bi-arrow-down-short'}`}></i>
                                            {stats.posts.growth >= 0 ? `+${stats.posts.growth}%` : `${stats.posts.growth}%`}{' '}
                                            <span className="text-muted font-normal">from last week</span>
                                        </span>
                                    </div>
                                    <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                                        <i className="bi bi-card-text"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Weather */}
                            <div className="col-12 col-sm-6 col-xl-3">
                                <div className="dashboard-card d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-medium">
                                            {weather.city ? `Weather (${weather.city})` : 'Farm Weather'}
                                        </span>
                                        <h3 className="fw-bold text-dark mt-2 mb-1">
                                            {weather.loading ? '...' : (weather.temp !== null ? `${weather.temp}°C` : 'N/A')}
                                        </h3>
                                        <span className="text-info small fw-medium">
                                            <i className="bi bi-cloud-sun me-1"></i>
                                            {weather.description || 'Live updates'}
                                        </span>
                                    </div>
                                    <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                                        <i className="bi bi-sun"></i>
                                    </div>
                                </div>
                            </div>

                            {/* Reports */}
                            <div className="col-12 col-sm-6 col-xl-3">
                                <div className="dashboard-card d-flex justify-content-between align-items-start">
                                    <div>
                                        <span className="text-muted small fw-medium">Pending Reports</span>
                                        <h3 className="fw-bold text-dark mt-2 mb-1">
                                            {loadingCounts ? '...' : `${stats.reports.total} Critical`}
                                        </h3>
                                        <span className="text-danger small fw-medium">
                                            <i className="bi bi-arrow-up-short"></i>+{stats.reports.newCount}{' '}
                                            <span className="text-muted font-normal">new this week</span>
                                        </span>
                                    </div>
                                    <div className="stat-icon bg-danger bg-opacity-10 text-danger">
                                        <i className="bi bi-exclamation-triangle"></i>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* GRAPHICS & QUICK ACTIONS */}
                        <div className="row g-3 mb-4">
                            <div className="col-12 col-lg-4">
                                <div className="dashboard-card h-100 p-3">
                                    <h6 className="fw-bold text-dark mb-2">Cow Happiness Index</h6>
                                    <div className="rounded-3 overflow-hidden" style={{ height: '180px' }}>
                                        <img src={cowImg} alt="Cow Happiness" className="w-100 h-100 object-fit-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
                                <div className="dashboard-card h-100 p-3">
                                    <h6 className="fw-bold text-dark mb-2">Spud-tacular Growth</h6>
                                    <div className="rounded-3 overflow-hidden" style={{ height: '180px' }}>
                                        <img src={potatoImg} alt="Spud Growth" className="w-100 h-100 object-fit-cover" />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 col-lg-4">
                                <div className="dashboard-card h-100 d-flex flex-column justify-content-between">
                                    <h6 className="fw-bold text-dark mb-3">System Status</h6>
                                    
                                    <div className={`p-3 rounded-3 d-flex justify-content-between align-items-center mb-3 ${isOnline ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                        <span className="fw-medium small">Firebase connection: <strong>{isOnline ? 'Online' : 'Offline'}</strong></span>
                                        <span className={`rounded-circle ${isOnline ? 'bg-success' : 'bg-danger'}`} style={{ width: '10px', height: '10px' }}></span>
                                    </div>

                                    <div className="d-flex flex-column gap-2">
                                        <button className="action-btn-outline w-100" onClick={() => navigate('/users')}>
                                            Manage Farm Users
                                        </button>
                                        <button className="action-btn-outline w-100" onClick={() => navigate('/newsfeed')}>
                                            Open News Feed
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RECENT ACTIVITIES TABLE */}
                        <div className="dashboard-card">
                            <h6 className="fw-bold text-dark mb-3">Recent Agricultural Activity</h6>
                            
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="text-muted small">
                                            <th>User</th>
                                            <th>Description</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingActivities ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4">
                                                    <div className="spinner-border spinner-border-sm text-secondary"></div>
                                                </td>
                                            </tr>
                                        ) : activities.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 text-muted small">No recent activities found</td>
                                            </tr>
                                        ) : (
                                            activities.map((act) => (
                                                <tr key={act.id}>
                                                    <td>
                                                        <span className="fw-medium small text-dark">
                                                            {act.senderName || 'Anonymous User'}
                                                        </span>
                                                    </td>
                                                    <td className="small text-secondary">
                                                        {renderActivityText(act)}
                                                    </td>
                                                    <td className="small text-muted">
                                                        {act.createdAt?.toDate ? act.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                    </td>
                                                    <td>
                                                        {act.type === 'report_post' ? (
                                                            <span className="badge-status badge-danger-light">
                                                                <i className="bi bi-exclamation-circle"></i> Alert
                                                            </span>
                                                        ) : (
                                                            <span className="badge-status badge-success-light">
                                                                <i className="bi bi-check-circle"></i> Active
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;