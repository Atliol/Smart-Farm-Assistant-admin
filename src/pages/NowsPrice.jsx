// src/pages/NowsPrice.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';

const defaultCityPrices = { paddy: '', matpe: '', pigeonPea: '', salt: '', onion: '' };
const priceCategories = [
  { key: 'paddy', label: 'စပါးဈေး', unit: 'တင်း ၁၀၀', icon: '🌾', bg: '#e6fffa', border: '#81e6d9' },
  { key: 'matpe', label: 'မတ်ပဲဈေး', unit: 'တစ်တန်', icon: '🫘', bg: '#ebf8ff', border: '#90cdf4' },
  { key: 'pigeonPea', label: 'ပဲစင်းငုံဈေး', unit: 'တစ်တန်', icon: '🌰', bg: '#fff7ed', border: '#f6ad55' },
  { key: 'salt', label: 'ဆားဈေး', unit: 'တစ်ကီလို', icon: '🧂', bg: '#f0f7ff', border: '#63b3ed' },
  { key: 'onion', label: 'ကြက်သွန်ဈေး', unit: 'တစ်ကီလို', icon: '🧅', bg: '#fff5f5', border: '#fc8181' },
];

const NowsPrice = () => {
  const [prices, setPrices] = useState({ yangon: defaultCityPrices, mandalay: defaultCityPrices });
  const [activeCity, setActiveCity] = useState('yangon');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const docRef = doc(db, 'crop_prices', 'today');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrices({
            yangon: { ...defaultCityPrices, ...(data.yangon || {}) },
            mandalay: { ...defaultCityPrices, ...(data.mandalay || {}) },
          });
        }
      } catch (error) {
        console.error('Error fetching crop prices:', error);
      }
    };
    fetchPrices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrices((prev) => ({
      ...prev,
      [activeCity]: { ...prev[activeCity], [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', text: '' });
    try {
      await setDoc(doc(db, 'crop_prices', 'today'), {
        yangon: prices.yangon,
        mandalay: prices.mandalay,
        updatedAt: new Date().toISOString(),
      });
      setStatus({ type: 'success', text: 'ယနေ့မြို့ရှိဈေးနှုန်းများကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။' });
    } catch (error) {
      setStatus({ type: 'error', text: 'သိမ်းဆည်းရန် မအောင်မြင်ပါ- ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const cityLabels = { yangon: 'ရန်ကုန်', mandalay: 'မန္တလေး' };
  const summaryCards = priceCategories.map((cat) => ({
    label: cat.label,
    value: prices[activeCity][cat.key] || '---',
    icon: cat.icon,
    bg: cat.bg,
    border: cat.border,
    unit: cat.unit,
  }));

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />

        <main className="col-md-10 offset-md-2 bg-light min-vh-100 py-5">
          <div className="container px-4">
            <div className="row align-items-center mb-4">
              <div className="col-md-7">
                <h1 className="display-6 fw-bold">Crop Price Dashboard</h1>
                <p className="text-muted mb-0">ယနေ့ပေါက်ဈေးနှုန်းများကို အချိန်နဲ့တစ်ပြေးညီ ပြင်ဆင်ထားပါ။</p>
              </div>
              <div className="col-md-5 text-md-end mt-3 mt-md-0">
                <span className="badge bg-success rounded-pill py-2 px-3">Live update ready</span>
              </div>
            </div>

            <div className="row g-3 mb-5">
              <div className="col-12">
                <div className="rounded-4 p-4 shadow-sm bg-white border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between flex-column flex-md-row gap-3">
                    <div>
                      <h5 className="mb-1">မြို့အလိုက်ဈေးနှုန်းများ</h5>
                      <p className="mb-0 text-secondary">{cityLabels[activeCity]} မှာလက်ရှိကြော်ငြာထားသောဈေးနှုန်းများ</p>
                    </div>
                    {/* UI ပြင်ဆင်ထားသော City Switcher Toggle Tab */}
                    <div className="d-inline-flex bg-light p-1 rounded-pill border">
                      {Object.entries(cityLabels).map(([key, label]) => (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setActiveCity(key)}
                          className={`btn rounded-pill px-4 py-2 border-0 fw-semibold transition-all ${
                            activeCity === key
                              ? 'btn-primary text-white shadow-sm'
                              : 'text-secondary hover-bg-white'
                          }`}
                          style={{ transition: 'all 0.2s ease-in-out' }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-3 mb-5">
              {summaryCards.map((card) => (
                <div className="col-sm-6 col-lg-4" key={card.label}>
                  <div className="rounded-4 p-4 shadow-sm" style={{ backgroundColor: card.bg, border: `1px solid ${card.border}` }}>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h5 className="mb-1">{card.label}</h5>
                        <p className="mb-0 text-secondary">Current value</p>
                      </div>
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.8)' }}>
                        <span style={{ fontSize: 22 }}>{card.icon}</span>
                      </div>
                    </div>
                    <h2 className="fw-bold">{card.value}</h2>
                    <p className="mb-0 text-muted">Unit: {card.unit}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="row gx-4 gy-4">
              <div className="col-lg-8">
                <div className="card rounded-4 shadow-sm border-0">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4 flex-column flex-md-row gap-3">
                      <div>
                        <h3 className="h5 mb-0">ဈေးနှုန်းများ ပြင်ဆင်ရန်</h3>
                        <p className="text-muted mb-0">သင့်စနစ်အတွက် နောက်ဆုံးရ သတင်းအချက်အလက်ရယူရန်</p>
                      </div>
                      {/* UI ပြင်ဆင်ထားသော City Switcher Toggle Tab */}
                      <div className="d-inline-flex bg-light p-1 rounded-pill border">
                        {Object.entries(cityLabels).map(([key, label]) => (
                          <button
                            type="button"
                            key={key}
                            onClick={() => setActiveCity(key)}
                            className={`btn rounded-pill px-4 py-2 border-0 fw-semibold transition-all ${
                              activeCity === key
                                ? 'btn-primary text-white shadow-sm'
                                : 'text-secondary hover-bg-white'
                            }`}
                            style={{ transition: 'all 0.2s ease-in-out' }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {status.text && (
                      <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} rounded-4`}>
                        {status.text}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        {priceCategories.map((cat) => (
                          <div className="col-md-4" key={cat.key}>
                            <label className="form-label fw-semibold">{cat.label} ({cat.unit})</label>
                            <input
                              type="number"
                              name={cat.key}
                              value={prices[activeCity][cat.key]}
                              onChange={handleInputChange}
                              placeholder={`ဥပမာ - ၃၅၀၀၀၀၀`}
                              className="form-control rounded-4 border-secondary"
                              required
                            />
                          </div>
                        ))}
                      </div>

                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mt-4">
                        <div className="text-muted">သိမ်းဆည်းမီ အချက်အလက်များအား ထပ်စစ်ပါ။</div>
                        <button type="submit" disabled={loading} className="btn btn-success rounded-pill px-5 py-2">
                          {loading ? 'သိမ်းဆည်းနေပါသည်...' : 'ဈေးနှုန်းများကို သိမ်းမည်'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card rounded-4 shadow-sm border-0 h-100" style={{ backgroundColor: '#f8fbf8' }}>
                  <div className="card-body p-4">
                    <h5 className="mb-3">Quick tips</h5>
                    <ul className="list-unstyled mb-0">
                      <li className="mb-3">
                        <strong className="me-2">✔</strong> ဈေးနှုန်းနောက်ဆုံးတန်ဖိုးကို လက်ရှိအချိန်မှတ်ထားပါ။
                      </li>
                      <li className="mb-3">
                        <strong className="me-2">✔</strong> အမှားအယွင်းမရှိစေရန် ရိုက်ထည့်ချက်များအား နှစ်ချက်စစ်ပါ။
                      </li>
                      <li>
                        <strong className="me-2">✔</strong> အချိန်တိုင်းစာရင်းသွင်းရန် သတ်မှတ်ထားပါ။
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NowsPrice;