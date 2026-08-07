import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { updateProfile, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Settings = () => {
    const { currentUser } = useAuth();
    
    // Auto-dismiss helper
    const triggerSuccess = (setter, msg) => {
        setter(msg);
        setTimeout(() => setter(''), 4000);
    };

    // Profile States
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // Security States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securitySuccess, setSecuritySuccess] = useState('');
    const [securityError, setSecurityError] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);

    // System Config States (Notice Messages 2 ခု ခွဲထားပါသည်)
    const [dismissNoticeMsg, setDismissNoticeMsg] = useState('လူကြီးမင်း တိုင်ကြားထားသော ပို့စ်သည် လူမှုကွန်ရက် စည်းကမ်းချက်များနှင့် ညီညွတ်သဖြင့် တိုင်ကြားချက်အား ပယ်ဖျက်လိုက်ပါသည်။');
    const [deleteNoticeMsg, setDeleteNoticeMsg] = useState('လူကြီးမင်း တင်ထားသော ပို့စ်သည် လူမှုကွန်ရက် စည်းကမ်းချက်များနှင့် မညီညွတ်သဖြင့် Admin မှ ဖယ်ရှားလိုက်ပါသည်။');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [systemSuccess, setSystemSuccess] = useState('');
    const [systemLoading, setSystemLoading] = useState(false);

    useEffect(() => {
        const fetchSystemConfig = async () => {
            try {
                const configRef = doc(db, 'settings', 'config');
                const configSnap = await getDoc(configRef);
                if (configSnap.exists()) {
                    const data = configSnap.data();
                    if (data.dismissNoticeMessage) setDismissNoticeMsg(data.dismissNoticeMessage);
                    if (data.deleteNoticeMessage) setDeleteNoticeMsg(data.deleteNoticeMessage);
                    // ဓာတ်ဟောင်း data များအတွက် fallback ပြုလုပ်ထားခြင်း
                    if (!data.deleteNoticeMessage && data.defaultViolationMessage) {
                        setDeleteNoticeMsg(data.defaultViolationMessage);
                    }
                    if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
                }
            } catch (err) {
                console.error("Error loading system config: ", err);
            }
        };
        fetchSystemConfig();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileLoading(true);

        try {
            if (currentUser) {
                await updateProfile(currentUser, { displayName: displayName });
                triggerSuccess(setProfileSuccess, 'Admin ပရိုဖိုင် အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
            }
        } catch (err) {
            setProfileError('ပြင်ဆင်မှု မအောင်မြင်ပါ။ နောက်မှ ပြန်လည်ကြိုးစားပါ။');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setSecurityError('');
        
        if (newPassword !== confirmPassword) {
            return setSecurityError('လျှို့ဝှက်နံပါတ် အသစ်နှစ်ခု ကိုက်ညီမှုမရှိပါ။');
        }
        if (newPassword.length < 6) {
            return setSecurityError('လျှို့ဝှက်နံပါတ်သည် အနည်းဆုံး စာလုံး ၆ လုံး ရှိရပါမည်။');
        }

        setSecurityLoading(true);
        try {
            await updatePassword(currentUser, newPassword);
            triggerSuccess(setSecuritySuccess, 'လျှို့ဝှက်နံပါတ်ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ။');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            setSecurityError('လုံခြုံရေးအရ Password မပြောင်းမီ လတ်တလော Login ပြန်ဝင်ရန် လိုအပ်ပါသည်။');
        } finally {
            setSecurityLoading(false);
        }
    };

    const handleSystemUpdate = async (e) => {
        e.preventDefault();
        setSystemLoading(true);

        try {
            const configRef = doc(db, 'settings', 'config');
            await setDoc(configRef, {
                dismissNoticeMessage: dismissNoticeMsg,
                deleteNoticeMessage: deleteNoticeMsg,
                maintenanceMode: maintenanceMode,
                updatedAt: new Date()
            }, { merge: true });
            
            triggerSuccess(setSystemSuccess, 'စနစ်ဆက်တင်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။');
        } catch (err) {
            console.error(err);
            alert('စနစ်ဆက်တင်များ သိမ်းဆည်းမှု မအောင်မြင်ပါ။');
        } finally {
            setSystemLoading(false);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <Sidebar />
                <div className="col-md-10 offset-md-2 p-4" style={{ minHeight: '100vh', backgroundColor: '#f3f8f5' }}>
                    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                        
                        <div className="mb-4">
                            <h3 className="fw-bold text-success mb-1">System & Admin Settings</h3>
                            <p className="text-muted small">စနစ်တစ်ခုလုံး၏ စည်းကမ်းချက်များနှင့် အက်ဒမင် ပရိုဖိုင်အား ပြင်ဆင်ရန်</p>
                        </div>

                        <div className="row g-4">
                           
                            {/* System Configurations */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
                                    <h5 className="fw-bold text-success mb-3"><i className="bi bi-sliders"></i> System Configurations</h5>
                                    {systemSuccess && <div className="alert alert-success border-0 small py-2">{systemSuccess}</div>}
                                    <form onSubmit={handleSystemUpdate}>
                                        
                                        {/* Notice Message 1: Dismiss Report */}
                                        <div className="mb-4">
                                            <label className="form-label text-secondary small fw-semibold">
                                                <i className="bi bi-shield-check text-success me-1"></i> Dismiss Report Notice Message (တိုင်ကြားချက် ပယ်ဖျက်သည့် အကြောင်းကြားစာ)
                                            </label>
                                            <textarea 
                                                className="form-control bg-light border-0 p-3 text-secondary" 
                                                rows="3" 
                                                value={dismissNoticeMsg} 
                                                onChange={(e) => setDismissNoticeMsg(e.target.value)} 
                                                required 
                                                style={{ borderRadius: '12px', fontSize: '13.5px' }} 
                                            />
                                        </div>

                                        {/* Notice Message 2: Delete Post */}
                                        <div className="mb-4">
                                            <label className="form-label text-secondary small fw-semibold">
                                                <i className="bi bi-trash text-danger me-1"></i> Delete Post Notice Message (ပို့စ် ဖယ်ရှားသည့် အကြောင်းကြားစာ)
                                            </label>
                                            <textarea 
                                                className="form-control bg-light border-0 p-3 text-secondary" 
                                                rows="3" 
                                                value={deleteNoticeMsg} 
                                                onChange={(e) => setDeleteNoticeMsg(e.target.value)} 
                                                required 
                                                style={{ borderRadius: '12px', fontSize: '13.5px' }} 
                                            />
                                        </div>

                                        {/* Maintenance Mode Toggle */}
                                        <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 mb-4">
                                            <div>
                                                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '14.5px' }}>App Maintenance Mode</h6>
                                                <p className="text-muted small m-0">မိုဘိုင်းလ်အက်ပ်အား ခေတ္တ ပြုပြင်ထိန်းသိမ်းမှုစနစ်အဖြစ် သတ်မှတ်ရန်</p>
                                            </div>
                                            <div className="form-check form-switch fs-4">
                                                <input className="form-check-input" type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} style={{ cursor: 'pointer' }} />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-success px-4 py-2.5 fw-semibold" disabled={systemLoading} style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #2ecc71, #27ae60)', border: 'none' }}>
                                            {systemLoading ? 'Saving...' : 'Save System Configurations'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;