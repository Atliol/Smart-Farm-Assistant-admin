import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 🔥 Firebase User အစား ပုံသေ username သိမ်းမည့် state သို့ ပြောင်းလဲထားသည်
    const [currentUser, setCurrentUser] = useState(
        localStorage.getItem('adminUserName') // Session ထိန်းရန် LocalStorage မှ ပြန်ဖတ်မည်
    );
    const [loading, setLoading] = useState(false);

    // Login Function (Username/Password အား Firebase မသုံးဘဲ ပုံသေစစ်ဆေးခြင်း)
    const login = (username, password) => {
        setLoading(true);
        // 🔥 လုံုံခြုံရေး Demo အဆင့်အတွက် Username: admin / Password: admin ဟု ပုံသေစစ်ဆေးသည်
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('adminUserName', 'admin'); // Browser ပိတ်သော်လည်း Login မပြုတ်စေရန် သိမ်းဆည်းသည်
            setCurrentUser('admin');
            setLoading(false);
            return Promise.resolve(true); // အောင်မြင်ကြောင်း အချက်ပြသည်
        } else {
            setLoading(false);
            return Promise.reject(new Error('Username သို့မဟုတ် Password မှားယွင်းနေပါသည်။')); // ကျရှုံးကြောင်း Error ပြန်သည်
        }
    };

    // Logout Function
    const logout = () => {
        localStorage.removeItem('adminUserName'); // LocalStorage မှ ဖျက်ထုတ်သည်
        setCurrentUser(null);
        return Promise.resolve(true);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);