'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Award, Calendar, BookOpen, ChevronRight, Play, CheckCircle2, 
  AlertTriangle, HelpCircle, XCircle, TrendingUp, Cpu, MessageSquare, Clipboard, Search, Sun, Moon
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function parseEvaluation(evaluationJson: string) {
  try {
    const raw = JSON.parse(evaluationJson);
    const base = raw.evaluation ? { ...raw.evaluation, ...raw.feedback, ...raw } : raw;
    
    // Normalize technicalAccuracy/correctness to a decimal fraction [0, 1]
    let techAcc = base.technicalAccuracy !== undefined ? base.technicalAccuracy : (base.correctness !== undefined ? base.correctness : 0);
    if (techAcc > 1) techAcc = techAcc / 100; // Normalize percentage to fraction if returned as e.g. 60
    
    return {
      technicalAccuracy: techAcc,
      conceptualCoverage: base.conceptualCoverage || base.core_concepts || [],
      missedConcepts: base.missedConcepts || base.missed_details || base.critical_details_missed || [],
      briefFeedback: base.briefFeedback || base.brief_feedback || base.feedback || base.critique || 'No feedback provided.'
    };
  } catch (err) {
    return {
      technicalAccuracy: 0,
      conceptualCoverage: [],
      missedConcepts: [],
      briefFeedback: 'Error parsing evaluation.'
    };
  }
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [curriculum, setCurriculum] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme') || 'dark';
      setTheme(saved as any);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('app-theme', next);
  };
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [difficulty, setDifficulty] = useState<'JUNIOR' | 'MID' | 'SENIOR'>('MID');
  const [proctorStrictness, setProctorStrictness] = useState<'SOFT' | 'STRICT' | 'PARALYZE'>('STRICT');
  const [synthVoice, setSynthVoice] = useState<'MALE' | 'FEMALE' | 'MUTED'>('FEMALE');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidateJson, setNewCandidateJson] = useState(`{
  "member": {
    "id": "CAND-004",
    "name": "Jane Miller",
    "jobRole": "Fullstack Software Engineer",
    "yearsExperience": 4,
    "education": "BS in Computer Science",
    "status": "NOT_STARTED"
  },
  "missions": [
    { "day": 7, "title": "Embeddings Explained", "passed": true, "attempts": 1 },
    { "day": 8, "title": "Vector Databases Overview", "passed": true, "attempts": 1 }
  ],
  "signals": {
    "commitDays": 15,
    "missionsCompleted": 20,
    "missionsFirstTry": 12
  }
}`);
  const [newCandidateError, setNewCandidateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCandidates = candidates.filter(candidate => {
    const name = candidate.member?.name || '';
    const id = candidate.member?.id || '';
    const role = candidate.member?.jobRole || '';
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || id.toLowerCase().includes(q) || role.toLowerCase().includes(q);
  });

  const handleAddCandidateSubmit = async () => {
    setNewCandidateError(null);
    try {
      const parsed = JSON.parse(newCandidateJson);
      
      // Basic validation
      if (!parsed.member || !parsed.member.id || !parsed.member.name) {
        throw new Error("Invalid JSON schema. Candidate record must contain member.id and member.name properties.");
      }

      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save candidate to JSON data storage.');
      }

      // Success
      setCandidates(data.candidates || []);
      setSelectedCandidate(parsed);
      setShowAddModal(false);
      setNewCandidateError(null);
      alert(`Candidate ${parsed.member.name} registered successfully!`);
    } catch (err: any) {
      setNewCandidateError(err.message || 'Syntax Error: Invalid JSON code format.');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDiff = localStorage.getItem('interview_difficulty') as any;
      const savedProctor = localStorage.getItem('interview_proctoring') as any;
      const savedVoice = localStorage.getItem('interview_voice') as any;
      if (savedDiff) setDifficulty(savedDiff);
      if (savedProctor) setProctorStrictness(savedProctor);
      if (savedVoice) setSynthVoice(savedVoice);
    }
  }, []);

  const updateDifficulty = (val: 'JUNIOR' | 'MID' | 'SENIOR') => {
    setDifficulty(val);
    localStorage.setItem('interview_difficulty', val);
  };
  const updateProctor = (val: 'SOFT' | 'STRICT' | 'PARALYZE') => {
    setProctorStrictness(val);
    localStorage.setItem('interview_proctoring', val);
  };
  const updateVoice = (val: 'MALE' | 'FEMALE' | 'MUTED') => {
    setSynthVoice(val);
    localStorage.setItem('interview_voice', val);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        setCandidates(data.candidates || []);
        setCurriculum(data.curriculum || null);
        if (data.candidates && data.candidates.length > 0) {
          setSelectedCandidate(data.candidates[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
        setMounted(true);
      }
    }
    fetchData();
  }, []);

  // Fetch previous session if exists
  useEffect(() => {
    if (!selectedCandidate) return;
    async function checkSession() {
      setSessionLoading(true);
      setActiveSession(null);
      try {
        const res = await fetch(`/api/interview?sessionId=session-${selectedCandidate.member.id}`);
        if (res.ok) {
          const session = await res.json();
          setActiveSession(session);
        }
      } catch (err) {
        // Session might not exist, which is fine
      } finally {
        setSessionLoading(false);
      }
    }
    checkSession();
  }, [selectedCandidate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'hsl(var(--bg-primary))', color: 'hsl(var(--text-primary))' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontFamily: 'Outfit', fontWeight: 500, letterSpacing: '0.5px' }}>Initializing AI Recruiter Portal...</p>
        </div>
      </div>
    );
  }

  // Calculate Average signals for chart
  const avgMissionsCompleted = candidates.reduce((acc, curr) => acc + curr.signals.missionsCompleted, 0) / candidates.length;
  const avgMissionsFirstTry = candidates.reduce((acc, curr) => acc + curr.signals.missionsFirstTry, 0) / candidates.length;
  const avgCommitDays = candidates.reduce((acc, curr) => acc + curr.signals.commitDays, 0) / candidates.length;

  const chartData = selectedCandidate ? [
    {
      name: 'Missions Completed',
      Candidate: selectedCandidate.signals.missionsCompleted,
      Average: Math.round(avgMissionsCompleted * 10) / 10
    },
    {
      name: 'First-Try Success',
      Candidate: selectedCandidate.signals.missionsFirstTry,
      Average: Math.round(avgMissionsFirstTry * 10) / 10
    },
    {
      name: 'Commit Days',
      Candidate: selectedCandidate.signals.commitDays,
      Average: Math.round(avgCommitDays * 10) / 10
    }
  ] : [];


  // Start interview session handler
  const handleStartInterview = () => {
    if (!selectedCandidate) return;
    const sessionId = `session-${selectedCandidate.member.id}`;
    router.push(`/interview/${sessionId}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'hsl(var(--bg-primary))', color: 'hsl(var(--text-primary))', padding: '24px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: white !important;
            color: black !important;
          }
          header,
          .no-print,
          aside,
          nav,
          button,
          footer,
          input,
          .glass-panel:not(.print-target),
          .glow-dot-teal {
            display: none !important;
          }
          .print-target {
            border: none !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          h1, h2, h3, h4, p, span, li, strong, div {
            color: black !important;
            text-shadow: none !important;
          }
          .print-candidate-header {
            display: block !important;
            margin-bottom: 24px;
            border-bottom: 2px solid #333 !important;
            padding-bottom: 12px;
          }
          .print-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 30px !important;
          }
          .print-target,
          .print-target div,
          .print-target section,
          .print-target aside {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
          }
        }
        .print-candidate-header {
          display: none;
        }
      `}} />
      
      {/* Header */}
      <header className="no-print" style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            ABTalks AI Interview Agent <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: 400 }}>| Evaluation Center</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
          <span>Active Cohort: AI Cohort · 31 Days</span>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--text-primary))',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(128,128,128,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>



      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', flex: 1 }}>
        
        {/* Left Column: Candidate List */}
        <section className="glass-panel no-print" style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'sticky',
          top: '24px',
          maxHeight: 'calc(100vh - 48px)',
          alignSelf: 'start',
          zIndex: 5
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-secondary))', borderBottom: '1px solid hsla(220, 15%, 20%, 0.6)', paddingBottom: '12px' }}>
            <Users size={16} />
            <h2 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidates Matrix</h2>
          </div>
          
          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid rgba(44, 12, 96, 0.1)',
                background: 'rgba(44, 12, 96, 0.02)',
                color: 'hsl(var(--text-primary))',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'Outfit'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 240px)' }}>
            {filteredCandidates.map(candidate => {
              const isSelected = selectedCandidate?.member.id === candidate.member.id;
              const statusColor = 
                candidate.member.status === 'COMPLETED' ? 'hsl(var(--status-success))' : 
                candidate.member.status === 'IN_PROGRESS' ? 'hsl(var(--status-warning))' : 
                'hsl(var(--text-muted))';
              
              return (
                <button
                  key={candidate.member.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'hsl(var(--text-primary))',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Outfit'
                  }}
                  className={isSelected ? 'neon-border-purple' : 'glass-card'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{candidate.member.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: statusColor, fontWeight: 600 }}>
                      {candidate.member.status === 'COMPLETED' ? 'Completed' : 
                       candidate.member.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                    </span>
                    <span style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', background: 'rgba(128, 128, 128, 0.08)', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>
                      {candidate.member.id}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add Candidate Trigger Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="neon-border-purple"
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(124, 58, 237, 0.08)',
              color: 'hsl(var(--accent-blue))',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: 'Outfit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '10px'
            }}
          >
            + Add Candidate (JSON)
          </button>
        </section>

        {/* Center / Right Panels */}
        {selectedCandidate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
            
            {/* Upper Section: Profile Details, Timeline Grid, Analytics Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
              
              {/* Profile Details & Progress Grid */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'Outfit' }}>{selectedCandidate.member.name}</h2>
                    <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', marginTop: '2px' }}>
                      {selectedCandidate.member.jobRole} • {selectedCandidate.member.education}
                    </p>
                  </div>
                  
                  {selectedCandidate.member.status !== 'COMPLETED' && selectedCandidate.member.status !== 'IN_PROGRESS' ? (
                    <button 
                      onClick={handleStartInterview}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#7c3aed',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        color: '#ffffff',
                        fontWeight: 750,
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
                        fontFamily: 'Outfit',
                        transition: 'transform 0.2s, background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#6d28d9';
                        e.currentTarget.style.transform = 'scale(1.03)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Play size={14} fill="#ffffff" />
                      Start Live Interview
                    </button>
                  ) : (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: selectedCandidate.member.status === 'COMPLETED' ? 'hsl(var(--status-success))' : 'hsl(var(--status-warning))',
                      background: 'rgba(128,128,128,0.08)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {selectedCandidate.member.status === 'COMPLETED' ? 'Assessment Completed' : 'Assessment In Progress'}
                    </div>
                  )}
                </div>

                {/* Cohort Progress Grid */}
                <div>
                  <h3 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    31-Day Cohort Timeline Grid
                  </h3>
                  
                  {/* Grid cells */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '8px', maxWidth: '440px' }}>
                    {Array.from({ length: 31 }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const mission = selectedCandidate.missions.find((m: any) => m.day === dayNumber);
                      
                      let cellBg = 'rgba(255,255,255,0.03)';
                      let cellBorder = 'rgba(255,255,255,0.08)';
                      let tooltipTitle = `Day ${dayNumber}: No mission details.`;

                      if (mission) {
                        tooltipTitle = `Day ${dayNumber}: ${mission.title}`;
                        if (mission.skipped) {
                          cellBg = 'rgba(255, 255, 255, 0.1)';
                          tooltipTitle += ' (Skipped)';
                        } else if (mission.passed) {
                          if (mission.attempts === 1) {
                            cellBg = 'hsla(145, 75%, 45%, 0.4)';
                            cellBorder = 'hsla(145, 75%, 45%, 0.6)';
                            tooltipTitle += ' (Passed on 1st try)';
                          } else {
                            cellBg = 'hsla(35, 90%, 55%, 0.3)';
                            cellBorder = 'hsla(35, 90%, 55%, 0.5)';
                            tooltipTitle += ` (Passed in ${mission.attempts} attempts)`;
                          }
                        } else if (mission.passed === false) {
                          cellBg = 'hsla(0, 85%, 60%, 0.3)';
                          cellBorder = 'hsla(0, 85%, 60%, 0.5)';
                          tooltipTitle += ` (Failed, attempts: ${mission.attempts})`;
                        }
                      }

                      return (
                        <div 
                          key={idx}
                          title={tooltipTitle}
                          style={{
                            height: '24px',
                            borderRadius: '4px',
                            background: cellBg,
                            border: `1px solid ${cellBorder}`,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: 'hsl(var(--text-secondary))'
                          }}
                        >
                          {dayNumber}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'hsl(var(--text-muted))', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', background: 'hsla(145, 75%, 45%, 0.4)', borderRadius: '2px' }}></div>
                      <span>Passed 1st Try</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', background: 'hsla(35, 90%, 55%, 0.3)', borderRadius: '2px' }}></div>
                      <span>Passed &gt; 1 Try</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>
                      <span>Skipped</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px' }}></div>
                      <span>Unlisted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Chart */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} />
                  Performance vs. Average
                </h3>
                
                <div style={{ width: '100%', height: '180px', fontSize: '11px' }}>
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222d3d" />
                        <XAxis dataKey="name" stroke="#5b6980" />
                        <YAxis stroke="#5b6980" />
                        <Tooltip contentStyle={{ backgroundColor: '#0d111a', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f3f8' }} />
                        <Bar dataKey="Candidate" fill="hsl(var(--accent-purple))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Average" fill="hsla(175, 80%, 45%, 0.5)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Lower Section: Active Session Report & Diagnostics */}
            <div className="glass-panel print-target" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Print-only Candidate Details Header */}
              {selectedCandidate && (
                <div className="print-candidate-header">
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '6px', color: 'black' }}>
                    AI Technical Interview Evaluation Report
                  </h1>
                  <p style={{ fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                    <strong>Candidate Name:</strong> {selectedCandidate.member.name}
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                    <strong>Job Role:</strong> {selectedCandidate.member.jobRole} | <strong>Experience:</strong> {selectedCandidate.member.yearsExperience} Years | <strong>Education:</strong> {selectedCandidate.member.education}
                  </p>
                  {activeSession && activeSession.status === 'COMPLETED' && (
                    <p style={{ fontSize: '14px', marginTop: '6px', fontWeight: 'bold', color: 'black' }}>
                      Overall Performance Rating: {activeSession.overallRating ? activeSession.overallRating.toFixed(1) : 'N/A'} / 5.0 Stars
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsla(220, 15%, 20%, 0.6)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clipboard size={18} />
                  Evaluation Report & Feedback
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {activeSession && activeSession.status === 'COMPLETED' && (
                    <button
                      onClick={() => window.print()}
                      className="no-print"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'hsl(var(--text-secondary))',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 500
                      }}
                    >
                      <Clipboard size={13} />
                      Export Report (PDF)
                    </button>
                  )}
                  {activeSession && activeSession.status === 'COMPLETED' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                      <span style={{ color: 'hsl(var(--status-warning))', fontWeight: 600, fontSize: '12px' }}>
                        Rating: {activeSession.overallRating ? activeSession.overallRating.toFixed(1) : 'N/A'}/5.0
                      </span>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starRating = activeSession.overallRating || 0;
                          const fill = i < Math.round(starRating) ? 'hsl(var(--status-warning))' : 'rgba(255,255,255,0.1)';
                          return (
                            <Award key={i} size={12} style={{ color: fill, fill: fill }} />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {activeSession && (
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: activeSession.status === 'COMPLETED' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                      color: activeSession.status === 'COMPLETED' ? 'hsl(var(--status-success))' : 'hsl(var(--status-warning))',
                      border: '1px solid',
                      borderColor: activeSession.status === 'COMPLETED' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'
                    }}>
                      {activeSession.status}
                    </span>
                  )}
                </div>
              </div>

              {sessionLoading ? (
                <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Loading evaluation...</p>
                </div>
              ) : activeSession ? (
                <div className="print-grid" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Left half: Final Feedback Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Executive Summary</h4>
                      <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'hsl(var(--text-secondary))' }}>
                        {activeSession.summary || 'No evaluation summary compiled yet. The interview is still in progress.'}
                      </p>
                    </div>

                    {activeSession.status === 'COMPLETED' && !activeSession.summary && (
                      <div style={{ margin: '4px 0 12px 0' }}>
                        <button
                          onClick={async () => {
                            try {
                              setSessionLoading(true);
                              const res = await fetch(`/api/interview?sessionId=${activeSession.id}&regenerate=true`);
                              if (res.ok) {
                                const updated = await res.json();
                                setActiveSession(updated);
                              }
                            } catch (err) {
                              console.error('Failed to compile report:', err);
                            } finally {
                              setSessionLoading(false);
                            }
                          }}
                          className="neon-border-purple"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: 'hsl(var(--accent-purple))',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Outfit',
                            fontSize: '13px'
                          }}
                        >
                          <Cpu size={14} style={{ animation: 'spin 4s linear infinite' }} />
                          Compile Evaluation Report
                        </button>
                      </div>
                    )}

                    {activeSession.status === 'IN_PROGRESS' && (
                      <div style={{ margin: '4px 0 12px 0' }}>
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to force terminate and evaluate this candidate's interview?")) {
                              try {
                                setSessionLoading(true);
                                const res = await fetch('/api/interview', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    sessionId: activeSession.id,
                                    done: true
                                  })
                                });
                                if (res.ok) {
                                  const checkRes = await fetch(`/api/interview?sessionId=${activeSession.id}`);
                                  if (checkRes.ok) {
                                    const updated = await checkRes.json();
                                    setActiveSession(updated);
                                    const cRes = await fetch('/api/candidates');
                                    const cData = await cRes.json();
                                    setCandidates(cData.candidates || []);
                                  }
                                }
                              } catch (err) {
                                console.error('Failed to force close session:', err);
                              } finally {
                                setSessionLoading(false);
                              }
                            }
                          }}
                          className="neon-border-purple"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: 'hsl(var(--accent-purple))',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'Outfit',
                            fontSize: '13px'
                          }}
                        >
                          <Cpu size={14} />
                          Force Close & Grade Interview
                        </button>
                      </div>
                    )}

                    {activeSession.status === 'COMPLETED' && (
                      <>
                        <div>
                          <h4 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Key Strengths</h4>
                          <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'hsl(var(--text-secondary))' }}>
                            {JSON.parse(activeSession.strengthsJson || '[]').map((s: string, idx: number) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <CheckCircle2 size={13} style={{ color: 'hsl(var(--status-success))', marginTop: '3px', flexShrink: 0 }} />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Developmental Gaps</h4>
                          <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'hsl(var(--text-secondary))' }}>
                            {JSON.parse(activeSession.gapsJson || '[]').map((g: string, idx: number) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <AlertTriangle size={13} style={{ color: 'hsl(var(--status-warning))', marginTop: '3px', flexShrink: 0 }} />
                                <span>{g}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Next Actions</h4>
                          <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'hsl(var(--text-secondary))' }}>
                            {JSON.parse(activeSession.nextJson || '[]').map((n: string, idx: number) => (
                              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <ChevronRight size={13} style={{ color: 'hsl(var(--accent-teal))', marginTop: '3px', flexShrink: 0 }} />
                                <span>{n}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right half: Turn-by-turn Diagnostics */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', fontWeight: 600 }}>Technical Diagnostics</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeSession.messages.map((msg: any, idx: number) => {
                        if (msg.role !== 'user' || !msg.evaluationJson) return null;
                        const evaluation = parseEvaluation(msg.evaluationJson);
                        return (
                          <div key={msg.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: 'hsl(var(--accent-blue))' }}>Turn {idx}</span>
                              <span style={{
                                fontWeight: 600,
                                color: evaluation.technicalAccuracy > 0.7 ? 'hsl(var(--status-success))' : 'hsl(var(--status-warning))',
                                background: evaluation.technicalAccuracy > 0.7 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: evaluation.technicalAccuracy > 0.7 ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)'
                              }}>
                                Accuracy: {Math.round(evaluation.technicalAccuracy * 100)}%
                              </span>
                            </div>
                            
                            <p style={{ color: 'hsl(var(--text-primary))', fontWeight: 500, marginTop: '2px' }}>{evaluation.briefFeedback}</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'hsl(var(--text-muted))', borderTop: '1px solid rgba(10,37,64,0.06)', paddingTop: '6px' }}>
                              <p><strong style={{ color: 'hsl(var(--text-secondary))' }}>Key Concepts:</strong> {evaluation.conceptualCoverage?.join(', ') || 'None'}</p>
                              {evaluation.missedConcepts?.length > 0 && (
                                <p><strong style={{ color: 'hsl(var(--status-warning))' }}>Missed Concepts:</strong> {evaluation.missedConcepts?.join(', ')}</p>
                              )}
                            </div>

                            <div style={{
                              maxHeight: '60px',
                              overflowY: 'auto',
                              fontSize: '11px',
                              background: 'rgba(10, 37, 64, 0.03)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(10, 37, 64, 0.05)',
                              color: 'hsl(var(--text-secondary))',
                              fontStyle: 'italic',
                              marginTop: '4px'
                            }}>
                              "{msg.content}"
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '8px', color: 'hsl(var(--text-muted))' }}>
                  <MessageSquare size={36} style={{ strokeWidth: 1.5 }} />
                  <p>No active interview found for this candidate.</p>
                  <p style={{ fontSize: '12px' }}>Click "Start Live Interview" above to initiate a session.</p>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* Add Candidate JSON Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(28, 13, 48, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            width: '580px',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'white',
            boxShadow: '0 20px 50px rgba(44,12,96,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Outfit' }}>
              Register Candidate (JSON Import)
            </h3>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', lineHeight: 1.5, marginTop: '-6px' }}>
              Paste a custom candidate structure matching the schema below. ID must be unique.
            </p>

            {newCandidateError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'hsl(var(--status-error))'
              }}>
                {newCandidateError}
              </div>
            )}

            <textarea
              value={newCandidateJson}
              onChange={(e) => setNewCandidateJson(e.target.value)}
              style={{
                width: '100%',
                height: '240px',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(44,12,96,0.1)',
                outline: 'none',
                background: 'rgba(44,12,96,0.02)',
                color: 'hsl(var(--text-primary))',
                resize: 'none',
                lineHeight: 1.4
              }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCandidateError(null);
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(44,12,96,0.1)',
                  background: 'transparent',
                  color: 'hsl(var(--text-secondary))',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCandidateSubmit}
                className="neon-border-purple"
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'hsl(var(--accent-blue))',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.2)'
                }}
              >
                Register Candidate
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
  );
}
