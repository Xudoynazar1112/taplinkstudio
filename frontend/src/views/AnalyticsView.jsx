import React, { useState } from 'react';

export default function AnalyticsView({ activePage }) {
  const [timeRange, setTimeRange] = useState('7d'); // 'today' | '7d' | '30d' | 'all'

  const baseViews = activePage?.views_count || 1240;
  const baseClicks = activePage?.clicks_count || 380;

  const multiplier = timeRange === 'today' ? 0.15 : (timeRange === '7d' ? 1 : (timeRange === '30d' ? 3.8 : 8.5));
  const views = Math.round(baseViews * multiplier);
  const clicks = Math.round(baseClicks * multiplier);
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : 0;

  // Chart daily points data based on timeRange
  const chartPoints = timeRange === 'today'
    ? [
        { label: '00:00', val: 12 }, { label: '04:00', val: 5 }, { label: '08:00', val: 42 },
        { label: '12:00', val: 98 }, { label: '16:00', val: 135 }, { label: '20:00', val: 88 },
      ]
    : [
        { label: 'Dush', val: 140 }, { label: 'Sesh', val: 185 }, { label: 'Chor', val: 160 },
        { label: 'Pay', val: 240 }, { label: 'Jum', val: 310 }, { label: 'Shan', val: 280 }, { label: 'Yak', val: 195 },
      ];

  const maxVal = Math.max(...chartPoints.map(p => p.val), 1);
  const chartHeight = 160;
  const chartWidth = 600;

  // Generate SVG path for smooth curve
  const pointsCoord = chartPoints.map((p, i) => {
    const x = (i / (chartPoints.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (p.val / maxVal) * (chartHeight - 40) - 20;
    return { x, y, label: p.label, val: p.val };
  });

  const pathD = pointsCoord.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${pointsCoord[pointsCoord.length - 1].x} ${chartHeight} L ${pointsCoord[0].x} ${chartHeight} Z`;

  return (
    <div className="analytics-view-container">
      <div className="view-page-header">
        <div className="header-title-actions">
          <div>
            <h2>Analitika va Konversiya Tahlili</h2>
            <p>Sahifangizga tashrif buyuruvchilar, bosilgan havolalar va konversiya oqimi</p>
          </div>

          <div className="chart-time-range-group">
            {[
              { id: 'today', label: 'Bugun' },
              { id: '7d', label: '7 Kun' },
              { id: '30d', label: '30 Kun' },
              { id: 'all', label: 'Barcha davr' },
            ].map(tr => (
              <button
                key={tr.id}
                type="button"
                className={`time-range-btn ${timeRange === tr.id ? 'active' : ''}`}
                onClick={() => setTimeRange(tr.id)}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Jami Ko'rishlar (Views)</span>
          <span className="kpi-value">{views.toLocaleString()}</span>
          <span className="kpi-trend positive">▲ +16.4% o'sish</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Havolalarga Bosishlar (Clicks)</span>
          <span className="kpi-value highlight-blue">{clicks.toLocaleString()}</span>
          <span className="kpi-trend positive">▲ +9.2% o'sish</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">O'rtacha Konversiya (CTR)</span>
          <span className="kpi-value highlight-green">{ctr}%</span>
          <span className="kpi-subtext">Yuqori samaradorlik</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Mobil Foydalanuvchilar</span>
          <span className="kpi-value highlight-gold">94.8%</span>
          <span className="kpi-subtext">Smartfon orqali kiruvchilar</span>
        </div>
      </div>

      {/* Interactive SVG Traffic Chart */}
      <div className="analytics-chart-box">
        <div className="chart-header-row">
          <h4 style={{ margin: 0, fontSize: '15px' }}>📈 Tashriflar Dinamikasi Grafigi</h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Jami: <strong>{views.toLocaleString()} ta ko'rish</strong>
          </span>
        </div>

        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-traffic-chart" style={{ width: '100%', height: '200px' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Stroke Line */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Labels */}
          {pointsCoord.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
              <text x={pt.x} y={chartHeight - 4} textAnchor="middle" fill="#94a3b8" fontSize="11">
                {pt.label}
              </text>
              <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="700">
                {pt.val}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Traffic Sources & Device breakdown */}
      <div className="analytics-details-grid mt-4">
        <div className="analytics-card-box">
          <h4 className="card-box-title">🌐 Trafik Manbalari (Referrers)</h4>
          <div className="source-list">
            {[
              { name: 'Instagram Bio', share: 58, count: Math.round(views * 0.58), color: '#E1306C' },
              { name: 'Telegram Kanallar & Guruhlar', share: 26, count: Math.round(views * 0.26), color: '#229ED9' },
              { name: 'TikTok Profil', share: 11, count: Math.round(views * 0.11), color: '#000000' },
              { name: 'To\'g\'ridan-to\'g\'ri havola / QR', share: 5, count: Math.round(views * 0.05), color: '#6366f1' },
            ].map((src, idx) => (
              <div key={idx} className="source-row">
                <div className="source-name-share">
                  <span>{src.name}</span>
                  <strong>{src.share}% <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({src.count.toLocaleString()})</small></strong>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${src.share}%`, backgroundColor: src.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card-box">
          <h4 className="card-box-title">🔥 Eng Ko'p Bosilgan Bloklar</h4>
          <div className="top-blocks-list">
            {(activePage?.blocks || []).slice(0, 5).map((b, i) => {
              const blockClicks = Math.round(clicks * (0.42 / (i + 1)));
              const blockCtr = views > 0 ? ((blockClicks / views) * 100).toFixed(1) : 0;
              return (
                <div key={b.id || i} className="top-block-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="top-block-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="top-block-index" style={{ width: '24px', height: '24px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      #{i + 1}
                    </span>
                    <span className="top-block-title" style={{ fontWeight: 600 }}>{b.title || b.label || b.type}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{blockClicks} bosish</strong>
                    <div style={{ fontSize: '11px', color: '#10b981' }}>{blockCtr}% CTR</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

