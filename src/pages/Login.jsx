import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // States (Email နေရာတွင် Username သို့ ပြောင်းလဲထားပါသည်)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // AuthContext ၏ login function သို့ username နှင့် password ပို့ပေးခြင်း
            await login(username, password);
            navigate('/'); // အောင်မြင်ပါက Dashboard/Homepage သို့ သွားမည်
        } catch (err) {
            console.error("Login Error: ", err);
            setError(err.message || 'Username သို့မဟုတ် Password မှားယွင်းနေပါသည်။');
            
            // Error ဖြစ်ပါက Card အား တုန်ခါစေမည့် Shake Animation အလုပ်လုပ်စေရန်
            setShake(true);
            setTimeout(() => setShake(false), 500); // 0.5s အကြာတွင် Shake State အား ပြန်ပိတ်ရန်
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            {/* Scoped CSS Styles for Login Page Only */}
            <style>{`
                .login-wrapper {
                    background: linear-gradient(-45deg, #0b2516, #144521, #2d6a4f, #0b2516);
                    background-size: 400% 400%;
                    animation: gradientBG 15s ease infinite;
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                    overflow: hidden;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                    font-family: 'Poppins', sans-serif;
                }

                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                /* Shake Effect Animation */
                @keyframes shakeCard {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
                    20%, 40%, 60%, 80% { transform: translateX(8px); }
                }

                .shake-animation {
                    animation: shakeCard 0.4s ease-in-out;
                }

                /* Glassmorphism Card Design */
                .login-card {
                    width: 100%;
                    max-width: 430px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    padding: 40px 35px;
                    transition: all 0.4s ease;
                }

                .login-card:hover {
                    box-shadow: 0 25px 60px rgba(82, 183, 136, 0.15), 
                                inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }

                /* Brand Icon Circle */
                .brand-icon-box {
                    width: 70px;
                    height: 70px;
                    background: linear-gradient(135deg, #52b788, #1b4332);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    box-shadow: 0 0 20px rgba(82, 183, 136, 0.4);
                }

                .title-text {
                    color: #ffffff;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .subtitle-text {
                    color: #a7c957;
                    font-size: 14px;
                }

                /* Custom Input Styling */
                .form-label {
                    color: #cbd5e1;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .input-group-text {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-right: none;
                    color: #94a3b8;
                    border-top-left-radius: 12px;
                    border-bottom-left-radius: 12px;
                }

                .form-control {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-left: none !important;
                    color: #ffffff !important;
                    font-size: 15px;
                    padding: 12px 12px 12px 0;
                    border-top-right-radius: 12px;
                    border-bottom-right-radius: 12px;
                    transition: all 0.3s ease;
                }

                .form-control:focus {
                    background: rgba(255, 255, 255, 0.08) !important;
                    border-color: rgba(82, 183, 136, 0.5) !important;
                    box-shadow: none !important;
                    color: #ffffff !important;
                }

                .input-group:focus-within .input-group-text {
                    border-color: rgba(82, 183, 136, 0.5);
                    color: #52b788;
                }

                .form-control::placeholder {
                    color: #64748b;
                }

                /* Organic Green Custom Button */
                .btn-login {
                    background: linear-gradient(135deg, #40916c 0%, #1b4332 100%);
                    border: none;
                    color: #ffffff;
                    padding: 13px;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 12px;
                    margin-top: 15px;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(45, 106, 79, 0.3);
                }

                .btn-login:hover {
                    background: linear-gradient(135deg, #2d6a4f 0%, #143624 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(82, 183, 136, 0.4);
                    color: #ffffff;
                }

                .btn-login:active {
                    transform: translateY(0);
                }

                /* Error Alert Custom */
                .alert-danger {
                    background: rgba(239, 68, 68, 0.15) !important;
                    border: 1px solid rgba(239, 68, 68, 0.3) !important;
                    color: #fca5a5 !important;
                    border-radius: 12px;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
            `}</style>

            <div className={`login-card ${shake ? 'shake-animation' : ''}`}>
                
                {/* Brand Logo Seedling Icon */}
                <div className="brand-icon-box">
                    <i className="bi bi-seedling text-white fs-2"></i>
                </div>
                
                {/* Header Title */}
                <div className="text-center mb-4">
                    <h3 className="title-text m-0">Admin Login</h3>
                    <p className="subtitle-text mt-1">Smart Farm Management System</p>
                </div>
                
                {/* Error Alert Message */}
                {error && (
                    <div className="alert alert-danger text-center py-2.5" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Username Field */}
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-person-fill"></i>
                            </span>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="username" 
                                placeholder="Enter username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="off" 
                                required 
                            />
                        </div>
                    </div>
                    
                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className="input-group">
                            <span className="input-group-text">
                                <i className="bi bi-lock-fill"></i>
                            </span>
                            <input 
                                type="password" 
                                className="form-control" 
                                id="password" 
                                placeholder="Enter password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    
                    {/* Sign In Button */}
                    <button type="submit" className="btn btn-login w-100 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <i className="bi bi-box-arrow-in-right fs-5"></i>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;