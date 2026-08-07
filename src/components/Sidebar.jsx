import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm("စနစ်အတွင်းမှ ထွက်ရန် သေချာပါသလား?")) {
            try {
                await logout();
                navigate('/login');
            } catch (error) {
                console.error("Logout error: ", error);
            }
        }
    };

    return (
        <div
            className="col-md-3 col-lg-2 sidebar p-0 d-flex flex-column justify-content-between position-fixed bg-dark text-white shadow-lg"
            style={{ height: '100vh', zIndex: 1000, minWidth: '260px' }}
        >
            <div>
                {/* Brand Logo & Title */}
                <div className="p-4 border-bottom border-secondary border-opacity-25">
                    <h3 className="text-success m-0 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-seedling fs-2"></i>Shwe Lel Yar
                    </h3>
                    <span className="text-white-50 small font-monospace ps-1 mt-1 d-block" style={{ fontSize: '11px', letterSpacing: '1.5px' }}>
                        ADMIN PANEL
                    </span>
                </div>

                {/* Navigation Links */}
                <ul className="nav flex-column mt-3 px-3 gap-2">
                    <li className="nav-item">
                        <NavLink 
                            to="/" 
                            className={({ isActive }) => `nav-link py-3 px-3 rounded-3 d-flex align-items-center gap-3 fw-semibold transition-all ${
                                isActive ? 'bg-success text-white shadow' : 'text-white-50 hover-bg-dark'
                            }`}
                            style={{ fontSize: '16px' }}
                        >
                            <i className="bi bi-pie-chart fs-4"></i> Dashboard
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink 
                            to="/newsfeed" 
                            className={({ isActive }) => `nav-link py-3 px-3 rounded-3 d-flex align-items-center gap-3 fw-semibold transition-all ${
                                isActive ? 'bg-success text-white shadow' : 'text-white-50 hover-bg-dark'
                            }`}
                            style={{ fontSize: '16px' }}
                        >
                            <i className="bi bi-newspaper fs-4"></i> News Feed
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink 
                            to="/prices" 
                            className={({ isActive }) => `nav-link py-3 px-3 rounded-3 d-flex align-items-center gap-3 fw-semibold transition-all ${
                                isActive ? 'bg-success text-white shadow' : 'text-white-50 hover-bg-dark'
                            }`}
                            style={{ fontSize: '16px' }}
                        >
                            <i className="bi bi-currency-dollar fs-4"></i> Crop Prices
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink 
                            to="/users" 
                            className={({ isActive }) => `nav-link py-3 px-3 rounded-3 d-flex align-items-center gap-3 fw-semibold transition-all ${
                                isActive ? 'bg-success text-white shadow' : 'text-white-50 hover-bg-dark'
                            }`}
                            style={{ fontSize: '16px' }}
                        >
                            <i className="bi bi-people fs-4"></i> Users
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink 
                            to="/notifications" 
                            className={({ isActive }) => `nav-link py-3 px-3 rounded-3 d-flex align-items-center gap-3 fw-semibold transition-all ${
                                isActive ? 'bg-success text-white shadow' : 'text-white-50 hover-bg-dark'
                            }`}
                            style={{ fontSize: '16px' }}
                        >
                            <i className="bi bi-bell fs-4"></i> Notifications
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink 
                            to="/settings" 
                            className={({ isActive }) => `nav-link py-3 px-3 rounded-3 d-flex align-items-center gap-3 fw-semibold transition-all ${
                                isActive ? 'bg-success text-white shadow' : 'text-white-50 hover-bg-dark'
                            }`}
                            style={{ fontSize: '16px' }}
                        >
                            <i className="bi bi-gear fs-4"></i> Settings
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Logout Button Area */}
            <div className="p-3 border-top border-secondary border-opacity-25">
                <button 
                    className="btn btn-outline-danger w-100 rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 fs-6" 
                    onClick={handleLogout}
                >
                    <i className="bi bi-power fs-5"></i> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;