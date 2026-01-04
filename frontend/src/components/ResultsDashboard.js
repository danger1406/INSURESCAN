import React, { useState } from 'react';

const ResultsDashboard = ({ data, onReset }) => {
  const [showHindi, setShowHindi] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle both old and new format for backwards compatibility
  const policyType = data.policy_type || 'health';
  const insurerName = data.insurer_name || 'Unknown Insurer';
  const sumInsured = data.sum_insured || 'Not specified';
  const safetyScore = data.safety_score || 50;
  const riskLevel = data.risk_level || (safetyScore >= 70 ? 'low' : safetyScore >= 40 ? 'medium' : 'high');
  const summary = data.summary || '';
  
  const redFlags = Array.isArray(data.red_flags) 
    ? data.red_flags.map(flag => 
        typeof flag === 'string' 
          ? { issue: flag, severity: 'medium', impact: '' }
          : flag
      )
    : [];
  
  const goodFeatures = Array.isArray(data.good_features)
    ? data.good_features.map(feature =>
        typeof feature === 'string'
          ? { feature: feature, benefit: '' }
          : feature
      )
    : [];
  
  const riskBreakdown = data.risk_breakdown || {
    room_rent_risk: 5,
    waiting_period_risk: 5,
    exclusions_risk: 5,
    sublimits_risk: 5,
    copay_risk: 5
  };
  
  const coverageGaps = data.coverage_gaps || [];
  const recommendations = data.recommendations || [];
  const jargonDecoded = data.jargon_decoded || [];

  const getScoreColor = (score) => {
    if (score >= 70) return { bg: 'var(--success)', light: 'var(--success-light)' };
    if (score >= 40) return { bg: 'var(--warning)', light: 'var(--warning-light)' };
    return { bg: 'var(--danger)', light: 'var(--danger-light)' };
  };

  const scoreColor = getScoreColor(safetyScore);

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'high': return { bg: 'var(--danger-light)', color: 'var(--danger)', border: 'var(--danger)' };
      case 'medium': return { bg: 'var(--warning-light)', color: 'var(--warning)', border: 'var(--warning)' };
      default: return { bg: 'var(--info-light)', color: 'var(--info)', border: 'var(--info)' };
    }
  };

  const getRiskBarColor = (value) => {
    if (value >= 7) return 'var(--danger)';
    if (value >= 4) return 'var(--warning)';
    return 'var(--success)';
  };

  const riskLabels = {
    room_rent_risk: { name: 'Room Rent', icon: '🏥' },
    waiting_period_risk: { name: 'Waiting Period', icon: '⏳' },
    exclusions_risk: { name: 'Exclusions', icon: '🚫' },
    sublimits_risk: { name: 'Sub-limits', icon: '📊' },
    copay_risk: { name: 'Co-payment', icon: '💰' }
  };

  const translations = {
    en: {
      title: 'Smart Policy Report',
      overview: 'Overview',
      risks: 'Red Flags',
      benefits: 'Benefits',
      advice: 'Advice',
      glossary: 'Glossary',
      riskBreakdown: 'Risk Breakdown',
      redFlags: 'Red Flags Detected',
      goodFeatures: 'Good Features',
      coverageGaps: 'Coverage Gaps',
      recommendations: 'Our Recommendations',
      jargonDecoded: 'Insurance Jargon Decoded',
      scanAnother: 'Scan Another',
      high: 'High Risk',
      medium: 'Medium Risk', 
      low: 'Low Risk'
    },
    hi: {
      title: 'स्मार्ट पॉलिसी रिपोर्ट',
      overview: 'सारांश',
      risks: 'खतरे',
      benefits: 'लाभ',
      advice: 'सलाह',
      glossary: 'शब्दावली',
      riskBreakdown: 'जोखिम विश्लेषण',
      redFlags: 'पहचाने गए खतरे',
      goodFeatures: 'अच्छी विशेषताएं',
      coverageGaps: 'कवरेज की कमी',
      recommendations: 'हमारी सिफारिशें',
      jargonDecoded: 'बीमा शब्दावली समझें',
      scanAnother: 'नई स्कैन',
      high: 'उच्च जोखिम',
      medium: 'मध्यम जोखिम',
      low: 'कम जोखिम'
    }
  };

  const t = showHindi ? translations.hi : translations.en;

  const tabs = [
    { id: 'overview', label: t.overview, icon: '📊' },
    { id: 'risks', label: t.risks, icon: '⚠️' },
    { id: 'benefits', label: t.benefits, icon: '✨' },
    { id: 'advice', label: t.advice, icon: '💡' },
    { id: 'glossary', label: t.glossary, icon: '📖' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-3xl font-bold">{t.title}</h1>
          <p style={{ color: 'var(--text-muted)' }} className="mt-1">InsureScan AI Analysis Complete</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHindi(!showHindi)}
            style={{ 
              backgroundColor: showHindi ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
              color: showHindi ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${showHindi ? 'var(--brand-primary)' : 'var(--border-color)'}`
            }}
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
          >
            {showHindi ? '🇬🇧 English' : '🇮🇳 हिंदी'}
          </button>
          <button
            onClick={onReset}
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)'
            }}
            className="px-4 py-2 rounded-lg font-medium text-sm hover:opacity-80 transition-opacity"
          >
            📄 {t.scanAnother}
          </button>
        </div>
      </div>

      {/* Main Score Card */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: `2px solid ${scoreColor.bg}`,
          borderRadius: '16px'
        }} 
        className="p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Score Circle */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div 
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%',
                border: `4px solid ${scoreColor.bg}`,
                backgroundColor: scoreColor.light
              }}
              className="flex items-center justify-center"
            >
              <div className="text-center">
                <div style={{ color: scoreColor.bg }} className="text-4xl font-bold">{safetyScore}</div>
                <div style={{ color: 'var(--text-muted)' }} className="text-xs">/100</div>
              </div>
            </div>
            <div 
              style={{ backgroundColor: scoreColor.light, color: scoreColor.bg }}
              className="mt-3 px-3 py-1 rounded-full text-xs font-semibold"
            >
              {riskLevel === 'low' ? t.low : riskLevel === 'medium' ? t.medium : t.high}
            </div>
          </div>

          {/* Policy Info & Summary */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-4">
              <span 
                style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)' }}
                className="px-3 py-1 rounded-full text-sm"
              >
                {policyType.charAt(0).toUpperCase() + policyType.slice(1)} Insurance
              </span>
              <span 
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                className="px-3 py-1 rounded-full text-sm"
              >
                {insurerName}
              </span>
              <span 
                style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)' }}
                className="px-3 py-1 rounded-full text-sm"
              >
                {sumInsured}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="leading-relaxed">{summary}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div 
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
        className="rounded-xl p-2 mb-6"
      >
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                backgroundColor: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--bg-card)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)'
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Breakdown */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="rounded-xl p-6">
              <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4 flex items-center gap-2">
                📊 {t.riskBreakdown}
              </h3>
              <div className="space-y-4">
                {Object.entries(riskBreakdown).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {riskLabels[key]?.icon} {riskLabels[key]?.name || key}
                      </span>
                      <span style={{ color: getRiskBarColor(value) }}>
                        {value}/10
                      </span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-tertiary)' }} className="h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ backgroundColor: getRiskBarColor(value), width: `${value * 10}%` }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="rounded-xl p-6">
              <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4 flex items-center gap-2">
                📈 Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)' }} className="rounded-xl p-4 text-center">
                  <div style={{ color: 'var(--danger)' }} className="text-2xl font-bold">{redFlags.length}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-sm">Red Flags</div>
                </div>
                <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)' }} className="rounded-xl p-4 text-center">
                  <div style={{ color: 'var(--success)' }} className="text-2xl font-bold">{goodFeatures.length}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-sm">Benefits</div>
                </div>
                <div style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)' }} className="rounded-xl p-4 text-center">
                  <div style={{ color: 'var(--warning)' }} className="text-2xl font-bold">{coverageGaps.length}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-sm">Gaps</div>
                </div>
                <div style={{ backgroundColor: 'var(--info-light)', border: '1px solid var(--info)' }} className="rounded-xl p-4 text-center">
                  <div style={{ color: 'var(--info)' }} className="text-2xl font-bold">{recommendations.length}</div>
                  <div style={{ color: 'var(--text-muted)' }} className="text-sm">Tips</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Red Flags Tab */}
        {activeTab === 'risks' && (
          <div className="space-y-4">
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold flex items-center gap-2">
              ⚠️ {t.redFlags}
            </h3>
            {redFlags.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <div style={{ color: 'var(--success)' }} className="font-semibold">No major red flags detected!</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {redFlags.map((flag, index) => {
                  const styles = getSeverityStyles(flag.severity);
                  return (
                    <div 
                      key={index} 
                      style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}` }}
                      className="rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          style={{ backgroundColor: styles.border }} 
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        >
                          {flag.severity === 'high' ? '!' : flag.severity === 'medium' ? '⚠' : 'i'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ color: 'var(--text-primary)' }} className="font-semibold">{flag.issue}</span>
                            <span 
                              style={{ backgroundColor: styles.border, color: 'white' }}
                              className="px-2 py-0.5 rounded text-xs font-medium uppercase"
                            >
                              {flag.severity}
                            </span>
                          </div>
                          {flag.impact && (
                            <p style={{ color: 'var(--text-secondary)' }} className="text-sm">{flag.impact}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {coverageGaps.length > 0 && (
              <div className="mt-8">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🕳️ {t.coverageGaps}
                </h3>
                <div style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)' }} className="rounded-xl p-4">
                  <ul className="space-y-2">
                    {coverageGaps.map((gap, index) => (
                      <li key={index} style={{ color: 'var(--warning)' }} className="flex items-center gap-2">
                        <span>✗</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-4">
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold flex items-center gap-2">
              ✨ {t.goodFeatures}
            </h3>
            <div className="grid gap-4">
              {goodFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)' }}
                  className="rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      style={{ backgroundColor: 'var(--success)' }}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                    >
                      ✓
                    </div>
                    <div className="flex-1">
                      <div style={{ color: 'var(--success-text)' }} className="font-semibold">{feature.feature}</div>
                      {feature.benefit && (
                        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">{feature.benefit}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advice Tab */}
        {activeTab === 'advice' && (
          <div className="space-y-4">
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold flex items-center gap-2">
              💡 {t.recommendations}
            </h3>
            {recommendations.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="rounded-xl p-8 text-center">
                <div style={{ color: 'var(--text-muted)' }}>No specific recommendations at this time.</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    style={{ backgroundColor: 'var(--brand-light)', border: '1px solid var(--brand-primary)' }}
                    className="rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        style={{ backgroundColor: 'var(--brand-primary)' }}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                      >
                        {index + 1}
                      </div>
                      <p style={{ color: 'var(--text-secondary)' }}>{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            <h3 style={{ color: 'var(--text-primary)' }} className="text-lg font-semibold flex items-center gap-2">
              📖 {t.jargonDecoded}
            </h3>
            {jargonDecoded.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }} className="rounded-xl p-8 text-center">
                <div style={{ color: 'var(--text-muted)' }}>No technical terms to decode.</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {jargonDecoded.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    className="rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        📚
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-primary)' }} className="font-semibold">{item.term}</div>
                        <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-1">{item.meaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing Mode Badge */}
      {data.processing_mode && (
        <div className="mt-8 text-center">
          <span 
            style={{ 
              backgroundColor: data.processing_mode === 'demo' ? 'var(--warning-light)' : 
                             data.processing_mode === 'ai' ? 'var(--success-light)' : 'var(--bg-tertiary)',
              color: data.processing_mode === 'demo' ? 'var(--warning)' : 
                    data.processing_mode === 'ai' ? 'var(--success)' : 'var(--text-muted)',
              border: `1px solid ${data.processing_mode === 'demo' ? 'var(--warning)' : 
                      data.processing_mode === 'ai' ? 'var(--success)' : 'var(--border-color)'}`
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          >
            {data.processing_mode === 'demo' ? '🎯 Demo Mode' : data.processing_mode === 'ai' ? '🤖 AI Analysis' : '📊 Mock Data'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ResultsDashboard;
