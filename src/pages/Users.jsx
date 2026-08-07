import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const Users = () => {
    // ==========================================
    // 1. DYNAMIC STATE (Firebase မှ ဆွဲယူမည့် Data)
    // ==========================================
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // 2. STATIC/LOCAL STATE (Client-side Search filter သီးသန့်)
    // ==========================================
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Fetch Dynamic Users List from Firebase Real-time
        const usersRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const tempUsers = [];
            snapshot.forEach(docSnap => {
                tempUsers.push({ id: docSnap.id, ...docSnap.data() });
            });
            setUsers(tempUsers);
            setLoading(false);
        }, (err) => {
            console.error("Firebase Users Fetch Error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Action Handler
    const handleDeleteUser = async (userId) => {
        if (window.confirm("ဤ User အား အကောင့်အပြီးဖျက်သိမ်းရန် သေချာပါသလား?")) {
            try {
                await deleteDoc(doc(db, 'users', userId));
                alert("User Account အား ဖျက်သိမ်းပြီးပါပြီ။");
            } catch (err) {
                console.error(err);
                alert("ဖျက်သိမ်း၍မရပါ။");
            }
        }
    };

    // Client-side filtering logic
    const filteredUsers = users.filter(user => 
        (user.displayName || '').toLowerCase().includes(search.toLowerCase()) || 
        (user.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container-fluid">
            <div className="row">
                {/* STATIC ELEMENT: Sidebar */}
                <Sidebar />

                <div className="col-md-10 offset-md-2 p-4" style={{ minHeight: '100vh', backgroundColor: '#f3f8f5' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        
                        {/* STATIC ELEMENT: Header & Search UI Layout */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="fw-bold text-success mb-1">Users Management</h3>
                                <p className="text-muted small m-0">စနစ်အတွင်းရှိ မန်ဘာများစာရင်းအား စီမံရန်</p>
                            </div>

                            {/* STATIC ELEMENT: Search Input Shell */}
                            <div className="input-group" style={{ maxWidth: '300px' }}>
                                <span className="input-group-text bg-white border-0 shadow-sm">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-0 shadow-sm py-2" 
                                    placeholder="Search users..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ borderRadius: '0 12px 12px 0' }}
                                />
                            </div>
                        </div>

                        {/* DYNAMIC CONTENT AREA */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success"></div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0" style={{ backgroundColor: '#fff' }}>
                                        {/* STATIC ELEMENT: Table Header */}
                                        <thead className="table-light">
                                            <tr>
                                                <th className="px-4 py-3 border-0 text-secondary fw-semibold">User Details</th>
                                                <th className="py-3 border-0 text-secondary fw-semibold">Role</th>
                                                <th className="py-3 border-0 text-secondary fw-semibold">User ID</th>
                                                <th className="py-3 border-0 text-secondary fw-semibold">Location</th>
                                                <th className="px-4 py-3 border-0 text-secondary fw-semibold text-end">Action</th>
                                            </tr>
                                        </thead>

                                        {/* DYNAMIC ELEMENT: Table Body Data from Firebase */}
                                        <tbody>
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-4 text-muted">
                                                        အသုံးပြုသူ စာရင်းမရှိသေးပါ။
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map(user => (
                                                    <tr key={user.id}>
                                                        {/* Dynamic Profile & Details */}
                                                        <td className="px-4 py-3">
                                                            <div className="d-flex align-items-center gap-3">
                                                                <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                                                                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="fw-bold text-dark">{user.displayName || 'No Name'}</div>
                                                                    <small className="text-muted">{user.email || 'No Email'}</small>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Dynamic Role */}
                                                        <td>
                                                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1.5" style={{ fontSize: '11px' }}>
                                                                {user.role || 'Member'}
                                                            </span>
                                                        </td>

                                                        {/* Dynamic Firebase Document ID */}
                                                        <td className="font-monospace small text-muted">{user.id}</td>

                                                        {/* Dynamic Location Field */}
                                                        <td className="font-monospace small text-muted">{user.location || '-'}</td>

                                                        {/* Dynamic Action Trigger */}
                                                        <td className="px-4 text-end">
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm rounded-pill px-3" 
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <i className="bi bi-trash me-1"></i> Delete Account
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;