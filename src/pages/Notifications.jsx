import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, writeBatch, serverTimestamp, getDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Notifications = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Fetch System Notice Messages from Firestore Config
    const getNoticeMessages = async () => {
        try {
            const configRef = doc(db, 'settings', 'config');
            const configSnap = await getDoc(configRef);
            if (configSnap.exists()) {
                const data = configSnap.data();
                return {
                    dismissNoticeMsg: data.dismissNoticeMessage || 'လူကြီးမင်း တိုင်ကြားထားသော ပို့စ်သည် လူမှုကွန်ရက် စည်းကမ်းချက်များနှင့် ညီညွတ်သဖြင့် တိုင်ကြားချက်အား ပယ်ဖျက်လိုက်ပါသည်။',
                    deleteNoticeMsg: data.deleteNoticeMessage || 'လူကြီးမင်း တင်ထားသော ပို့စ်သည် လူမှုကွန်ရက် စည်းကမ်းချက်များနှင့် မညီညွတ်သဖြင့် Admin မှ ဖယ်ရှားလိုက်ပါသည်။'
                };
            }
        } catch (err) {
            console.error('Error fetching settings/config: ', err);
        }
        // Fallback default messages
        return {
            dismissNoticeMsg: 'လူကြီးမင်း တိုင်ကြားထားသော ပို့စ်သည် လူမှုကွန်ရက် စည်းကမ်းချက်များနှင့် ညီညွတ်သဖြင့် တိုင်ကြားချက်အား ပယ်ဖျက်လိုက်ပါသည်။',
            deleteNoticeMsg: 'လူကြီးမင်း တင်ထားသော ပို့စ်သည် လူမှုကွန်ရက် စည်းကမ်းချက်များနှင့် မညီညွတ်သဖြင့် Admin မှ ဖယ်ရှားလိုက်ပါသည်။'
        };
    };

    useEffect(() => {
        const reportsQuery = query(
            collection(db, 'reports'), 
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
            const tempReports = [];
            snapshot.forEach((docSnap) => {
                tempReports.push({ id: docSnap.id, ...docSnap.data() });
            });

            tempReports.sort((a, b) => {
                const ta = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
                const tb = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
                return tb - ta;
            });

            setReports(tempReports);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reports: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Dismiss Action (settings/config မှ dismissNoticeMessage ကို ပို့မည်)
    const handleDismiss = async (reportId, reportData) => {
        if (!window.confirm("ဤ Report အား ပယ်ဖျက်ရန် သေချာပါသလား?")) return;

        const reporterUser = reportData.reportedByUid || reportData.reporterId || reportData.userId;

        setProcessingId(reportId);
        try {
            // settings/config မှ အသစ်ဆုံး မက်ဆေ့ဂျ်ကို ရယူခြင်း
            const { dismissNoticeMsg } = await getNoticeMessages();

            const batch = writeBatch(db);
            
            // 1. Report လုပ်သူဆီသို့ dismissNoticeMessage ပေးပို့ခြင်း
            if (reporterUser) {
                const reporterNotiRef = doc(collection(db, "notifications"));
                batch.set(reporterNotiRef, {
                    userId: reporterUser,
                    targetUserId: reporterUser,
                    senderName: "Admin", // senderName ထည့်သွင်းထားပါသည်
                    title: "တိုင်ကြားချက်ဆိုင်ရာ အကြောင်းကြားစာ",
                    message: dismissNoticeMsg,
                    isRead: false,
                    type: "report_dismissed",
                    createdAt: serverTimestamp(),
                    timestamp: serverTimestamp()
                });
            }

            // 2. Report Status Update ပြုလုပ်ခြင်း
            const reportRef = doc(db, "reports", reportId);
            batch.update(reportRef, { 
                status: "dismissed",
                updatedAt: serverTimestamp()
            });

            await batch.commit();
            alert("Report အား ပယ်ဖျက်ပြီး သက်ဆိုင်ရာ Reporter ထံ အကြောင်းကြားစာ ပို့ပြီးပါပြီ။");
        } catch (error) {
            console.error("Error dismissing report: ", error);
            alert("စနစ်ချို့ယွင်းချက်ရှိနေပါသည်။");
        } finally {
            setProcessingId(null);
        }
    };

    // Delete Post Action (settings/config မှ deleteNoticeMessage ကို ပို့မည်)
    const handleDeletePostAndNotify = async (reportId, reportData) => {
        if (!window.confirm("ဤ Post အား ဖျက်သိမ်းပြီး Post ပိုင်ရှင်ထံ Notification ပို့ရန် သေချာပါသလား?")) return;

        const { postId } = reportData;
        const postOwner = reportData.postOwnerId || reportData.authorId || reportData.postAuthorId;

        setProcessingId(reportId);
        try {
            // settings/config မှ အသစ်ဆုံး မက်ဆေ့ဂျ်ကို ရယူခြင်း
            const { deleteNoticeMsg } = await getNoticeMessages();

            const batch = writeBatch(db);

            // 1. Post ကို ဖျက်ခြင်း
            if (postId) {
                batch.delete(doc(db, "posts", postId));
            }

            // 2. Post ပိုင်ရှင်ဆီသို့ deleteNoticeMessage ပေးပို့ခြင်း
            if (postOwner) {
                const postOwnerNotiRef = doc(collection(db, "notifications"));
                batch.set(postOwnerNotiRef, {
                    userId: postOwner,
                    targetUserId: postOwner,
                    senderName: "Admin", // senderName ထည့်သွင်းထားပါသည်
                    title: "သင့်၏ ပို့စ် ဖျက်သိမ်းခံရပါသည်",
                    message: deleteNoticeMsg,
                    isRead: false,
                    type: "post_deleted",
                    createdAt: serverTimestamp(),
                    timestamp: serverTimestamp()
                });
            }

            // 3. Report Status Update ပြုလုပ်ခြင်း
            const reportRef = doc(db, "reports", reportId);
            batch.update(reportRef, { 
                status: "resolved",
                updatedAt: serverTimestamp()
            });

            await batch.commit();
            alert("Post အား ဖျက်သိမ်းပြီး Post ပိုင်ရှင်ထံ အကြောင်းကြားစာ ပို့ပြီးပါပြီ။");
        } catch (error) {
            console.error("Error deleting post: ", error);
            alert("ဆောင်ရွက်မှု မအောင်မြင်ပါ။");
        } finally {
            setProcessingId(null);
        }
    };

    // View Post Handler
    const handleViewPost = (postId) => {
        if (postId) {
            navigate('/newsfeed', { state: { highlightPostId: postId } });
        } else {
            alert("သက်ဆိုင်ရာ Post ID မရှိပါ သို့မဟုတ် ဖျက်ပြီးဖြစ်နိုင်ပါသည်။");
        }
    };

    const getImageList = (reportData) => {
        if (Array.isArray(reportData.imageUrls) && reportData.imageUrls.length > 0) return reportData.imageUrls;
        if (Array.isArray(reportData.postImageUrls) && reportData.postImageUrls.length > 0) return reportData.postImageUrls;
        if (Array.isArray(reportData.postImages) && reportData.postImages.length > 0) return reportData.postImages;
        if (Array.isArray(reportData.images) && reportData.images.length > 0) return reportData.images;
        
        const singleImg = reportData.imageUrl || reportData.postImageUrl || reportData.postImage || reportData.image;
        return singleImg ? [singleImg] : [];
    };

    return (
        <div className="container-fluid bg-white" style={{ minHeight: '100vh' }}>
            <style>{`
                .action-btn-circle {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    transition: all 0.2s ease-in-out;
                }
                .action-btn-circle:hover {
                    transform: translateY(-2px);
                    opacity: 0.9;
                }
                .btn-view { background-color: #e2e8f0; color: #475569; }
                .btn-dismiss { background-color: #15803d; color: #ffffff; }
                .btn-delete { background-color: #dc2626; color: #ffffff; }
                
                .badge-received {
                    background-color: #15803d;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    padding: 6px 16px;
                    border-radius: 20px;
                }
                .table > :not(caption) > * > * {
                    padding: 1.25rem 0.75rem;
                }
            `}</style>

            <div className="row">
                <Sidebar />
                
                <div className="col-md-10 offset-md-2 p-4">
                    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                        
                        {/* Header Section */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-dark mb-1">Reported Posts</h3>
                                <p className="text-muted small mb-0">Review and moderate content reported by community members.</p>
                            </div>
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 fw-semibold">
                                {reports.length} New Reports
                            </span>
                        </div>

                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success" role="status"></div>
                            </div>
                        )}

                        {!loading && reports.length === 0 && (
                            <div className="alert alert-success border-0 p-4 rounded-4 shadow-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                                <strong className="d-block mb-1 fs-5">လတ်တလော ရှင်းလင်းနေပါသည်!</strong>
                                <span className="small">ယခုအချိန်တွင် Report တင်ထားသော Post မရှိပါ။</span>
                            </div>
                        )}

                        {!loading && reports.length > 0 && (
                            <div className="table-responsive">
                                <table className="table align-middle border-bottom">
                                    <thead>
                                        <tr className="text-muted small border-bottom">
                                            <th style={{ width: '22%' }}>Reporter</th>
                                            <th style={{ width: '43%' }}>Reported Content</th>
                                            <th style={{ width: '15%' }}>Status</th>
                                            <th style={{ width: '20%' }} className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.map((report) => {
                                            const images = getImageList(report);
                                            const isProcessing = processingId === report.id;

                                            return (
                                                <tr key={report.id}>
                                                    {/* Reporter Profile */}
                                                    <td>
                                                        <div className="d-flex align-items-center gap-3">
                                                            {report.reportedByAvatar ? (
                                                                <img 
                                                                    src={report.reportedByAvatar} 
                                                                    alt="Reporter" 
                                                                    className="rounded-circle object-fit-cover" 
                                                                    style={{ width: '40px', height: '40px' }} 
                                                                />
                                                            ) : (
                                                                <div className="bg-secondary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                                                    <i className="bi bi-person text-secondary fs-5"></i>
                                                                </div>
                                                            )}
                                                            <span className="fw-bold text-dark text-uppercase small">
                                                                {report.reportedByName || 'UNKNOWN'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Content & Images */}
                                                    <td>
                                                        <p className="mb-2 text-dark fw-medium small" style={{ lineHeight: '1.4' }}>
                                                            {report.postContent || report.reason || 'Content unavailable for preview.'}
                                                        </p>
                                                        {images.length > 0 ? (
                                                            <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden' }}>
                                                                <img 
                                                                    src={images[0]} 
                                                                    alt="Post Content" 
                                                                    className="w-100 h-100 object-fit-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center border" style={{ width: '56px', height: '56px' }}>
                                                                <i className="bi bi-image text-muted fs-4"></i>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td>
                                                        <span className="badge-received">
                                                            RECEIVED
                                                        </span>
                                                    </td>

                                                    {/* Action Circular Buttons */}
                                                    <td>
                                                        <div className="d-flex justify-content-center align-items-center gap-3">
                                                            {/* View Button */}
                                                            <div className="text-center">
                                                                <button 
                                                                    className="action-btn-circle btn-view mx-auto"
                                                                    onClick={() => handleViewPost(report.postId)}
                                                                    title="View Post"
                                                                >
                                                                    <i className="bi bi-eye fs-5"></i>
                                                                </button>
                                                                <span className="d-block text-muted small mt-1" style={{ fontSize: '11px' }}>View</span>
                                                            </div>

                                                            {/* Dismiss Button */}
                                                            <div className="text-center">
                                                                <button 
                                                                    className="action-btn-circle btn-dismiss mx-auto"
                                                                    disabled={isProcessing}
                                                                    onClick={() => handleDismiss(report.id, report)}
                                                                    title="Dismiss Report"
                                                                >
                                                                    <i className="bi bi-check-lg fs-5"></i>
                                                                </button>
                                                                <span className="d-block text-muted small mt-1" style={{ fontSize: '11px' }}>Dismiss</span>
                                                            </div>

                                                            {/* Delete Button */}
                                                            <div className="text-center">
                                                                <button 
                                                                    className="action-btn-circle btn-delete mx-auto"
                                                                    disabled={isProcessing}
                                                                    onClick={() => handleDeletePostAndNotify(report.id, report)}
                                                                    title="Delete Post & Send Noti"
                                                                >
                                                                    {isProcessing ? (
                                                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                                                    ) : (
                                                                        <i className="bi bi-trash fs-5"></i>
                                                                    )}
                                                                </button>
                                                                <span className="d-block text-muted small mt-1" style={{ fontSize: '11px', maxWidth: '60px', lineHeight: '1.1' }}>
                                                                    Delete Post
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;