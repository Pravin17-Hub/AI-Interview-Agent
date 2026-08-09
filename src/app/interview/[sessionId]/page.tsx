'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, ChevronLeft, Terminal, ShieldAlert, Cpu, Sun, Moon, CheckCircle2
} from 'lucide-react';
import { initializeScrambledFont, obfuscateText, deobfuscateText, FontMapping } from '@/lib/font-scrambler';
import { SpotlightQuestion } from '@/components/SpotlightQuestion';

interface ChatInputFormProps {
  onSendMessage: (msg: string) => void;
  loading: boolean;
  done: boolean;
}

function ChatInputForm({ onSendMessage, loading, done }: ChatInputFormProps) {
  const [localInputText, setLocalInputText] = useState('');
  const localInputTextRef = useRef('');
  const skipPasteCheckRef = useRef(false);

  useEffect(() => {
    let lastLength = 0;
    
    const interval = setInterval(() => {
      const currentLength = localInputTextRef.current.length;
      const difference = currentLength - lastLength;
      
      if (skipPasteCheckRef.current) {
        lastLength = currentLength;
        skipPasteCheckRef.current = false;
        return;
      }

      if (difference > 12) {
        const revertedText = localInputTextRef.current.substring(0, lastLength);
        setLocalInputText(revertedText);
        localInputTextRef.current = revertedText;
      } else {
        lastLength = currentLength;
      }
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localInputText.trim() || loading || done) return;
    onSendMessage(localInputText.trim());
    setLocalInputText('');
    localInputTextRef.current = '';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
      <input
        type="text"
        value={localInputText}
        onChange={(e) => {
          setLocalInputText(e.target.value);
          localInputTextRef.current = e.target.value;
        }}
        placeholder="Type your answer here..."
        disabled={loading}
        style={{
          flex: 1,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px 20px',
          color: 'hsl(var(--text-primary))',
          fontFamily: 'var(--font-family)',
          fontSize: '15px',
          outline: 'none'
        }}
      />

      <button
        type="submit"
        disabled={!localInputText.trim() || loading}
        style={{
          background: 'hsl(var(--text-primary))',
          color: 'hsl(var(--bg-primary))',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 28px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Send size={14} />
        Send
      </button>
    </form>
  );
}

interface ScratchWhiteboardProps {
  initialValue: string;
}

const ScratchWhiteboard = React.memo(function ScratchWhiteboard({ initialValue }: ScratchWhiteboardProps) {
  const [localText, setLocalText] = useState(initialValue);

  return (
    <textarea
      value={localText}
      onChange={(e) => setLocalText(e.target.value)}
      style={{
        flex: 1,
        background: 'rgba(128,128,128,0.03)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        color: 'hsl(var(--text-primary))',
        fontFamily: 'monospace',
        fontSize: '13px',
        resize: 'none',
        outline: 'none',
        lineHeight: 1.5
      }}
    />
  );
});

export default function InterviewRoom() {
  const { sessionId } = useParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [activePhase, setActivePhase] = useState('STRENGTH_PROBE');
  const [candidateProfile, setCandidateProfile] = useState<any>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fullscreenConsent, setFullscreenConsent] = useState(false);
  const [fontMapping, setFontMapping] = useState<FontMapping | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeScrambledFont('candidate-room').then(mapping => {
        setFontMapping(mapping);
      }).catch(err => {
        console.error("Failed to load scrambled font:", err);
      });
    }
  }, []);

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

  // Proctoring configurations (run strictly in background, no popups shown)
  const [cheatingAlertText, setCheatingAlertText] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [fullscreenViolations, setFullscreenViolations] = useState(0);
  const [blurViolations, setBlurViolations] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const violationsRef = useRef(0);

  // syllabus config states
  const [difficulty, setDifficulty] = useState<'JUNIOR' | 'MID' | 'SENIOR'>('MID');
  const [proctorStrictness, setProctorStrictness] = useState<'SOFT' | 'STRICT' | 'PARALYZE'>('STRICT');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDiff = localStorage.getItem('interview_difficulty') as any;
      const savedProctor = localStorage.getItem('interview_proctoring') as any;
      if (savedDiff) setDifficulty(savedDiff);
      if (savedProctor) setProctorStrictness(savedProctor);
    }
  }, []);

  // Whiteboard / Scratch Notepad state
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hasInitializedRef = useRef(false);

  // Load Candidate info and Start Interview on mount
  useEffect(() => {
    if (!sessionId || hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    async function startSession() {
      setLoading(true);
      try {
        const idParts = (sessionId as string).split('-');
        const candidateId = idParts.slice(1).join('-');
        
        const candidatesRes = await fetch('/api/candidates');
        const data = await candidatesRes.json();
        const candidate = data.candidates?.find((c: any) => c.member.id === candidateId);
        
        if (!candidate) {
          throw new Error('Candidate profile not found.');
        }
        
        setCandidateProfile(candidate.member);

        // Check if session already exists
        const checkRes = await fetch(`/api/interview?sessionId=${sessionId}`);
        if (checkRes.ok) {
          const session = await checkRes.json();
          setMessages(session.messages || []);
          setActivePhase(session.currentPhase || 'STRENGTH_PROBE');
          
          if (session.status === 'COMPLETED') {
            setDone(true);
            setFeedback({
              summary: session.summary,
              strengths: JSON.parse(session.strengthsJson || '[]'),
              gaps: JSON.parse(session.gapsJson || '[]'),
              next: JSON.parse(session.nextJson || '[]')
            });
            setLoading(false);
            return;
          } else {
            // Re-entering an in-progress session. Force terminate and evaluate!
            setDone(true);
            try {
              const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  done: true
                })
              });
              if (res.ok) {
                const data = await res.json();
                setFeedback(data.feedback);
              }
            } catch (err) {
              console.error('Failed to auto-terminate session on re-entry:', err);
            } finally {
              setLoading(false);
            }
            return;
          }
        }

        // Initialize session in backend
        const initRes = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            candidate
          })
        });
        
        const initData = await initRes.json();
        if (!initRes.ok || initData.error) {
          setMessages([{ role: 'system', content: `Initialization error: ${initData.error || 'Unknown server error'}` }]);
        } else {
          setMessages([{ role: 'assistant', content: initData.reply }]);
        }
        
      } catch (err) {
        console.error('Error starting interview session:', err);
        setMessages([{ role: 'system', content: 'Failed to initialize session. Please verify candidates data is loaded and API keys are set.' }]);
      } finally {
        setLoading(false);
      }
    }

    startSession();
  }, [sessionId]);

  const triggerViolation = (type: 'tab' | 'focus' | 'fullscreen') => {
    if (isEnding || cheatingAlertText || isLockedOut) return;

    violationsRef.current += 1;
    const nextViolationCount = violationsRef.current;

    let violationText = '';
    if (type === 'tab') {
      violationText = `Tab switch detected!`;
      setBlurViolations((prev) => prev + 1);
    } else if (type === 'focus') {
      violationText = `Window focus lost!`;
      setBlurViolations((prev) => prev + 1);
    } else {
      violationText = `Fullscreen exited!`;
      setFullscreenViolations((prev) => prev + 1);
    }

    if (nextViolationCount < 3) {
      setCheatingAlertText(
        `Proctor Alert: ${violationText} (Warning ${nextViolationCount} of 2). You must remain in fullscreen mode and focused on this page.`
      );
    } else {
      // Reached 3rd violation - Lockout & Terminate session
      setIsEnding(true);
      setIsLockedOut(true);
      setDone(true);
      fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          done: true
        })
      }).catch((err) => {
        console.error('Failed to submit lockout termination:', err);
      });
    }
  };

  // --- PROCTORING ENGINE HOOKS ---
  useEffect(() => {
    if (!fullscreenConsent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isCopy = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c';
      const isPaste = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v';
      const isCut = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x';
      
      const isDevTools = 
        e.key === 'F12' || 
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'j') ||
        ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'i');
        
      const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';

      if (isCopy || isPaste || isCut || isDevTools || isPrint) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleSelectStart = (e: Event) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('selectstart', handleSelectStart, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('selectstart', handleSelectStart, true);
    };
  }, [fullscreenConsent]);

  // Tab switching & blur violations
  useEffect(() => {
    if (!fullscreenConsent) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerViolation('tab');
      }
    };

    const handleBlur = () => {
      triggerViolation('focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [fullscreenConsent]);

  // Fullscreen monitor
  useEffect(() => {
    if (!fullscreenConsent) return;
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        triggerViolation('fullscreen');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fullscreenConsent]);

  // Scroll transcript to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message turn
  const handleSendMessageDirectly = async (userMsg: string) => {
    if (loading || done) return;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMsg
        })
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        setMessages(prev => [...prev, { role: 'system', content: `Error: ${data.error || 'Server error occurred.'}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        setDone(data.done);
        if (data.done) {
          setFeedback(data.feedback);
        }
      }
      
      const sessionRes = await fetch(`/api/interview?sessionId=${sessionId}`);
      if (sessionRes.ok) {
        const session = await sessionRes.json();
        setActivePhase(session.currentPhase || 'STRENGTH_PROBE');
      }
    } catch (err) {
      console.error('Error sending message turn:', err);
      setMessages(prev => [...prev, { role: 'system', content: 'Connection lost. Message failed to deliver.' }]);
    } finally {
      setLoading(false);
    }
  };

  // End Interview handler
  const handleEndInterview = async () => {
    setIsEnding(true);
    if (confirm("Are you sure you want to end this interview? This will submit your current answers for grading and evaluation.")) {
      setLoading(true);
      try {
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            done: true
          })
        });
        if (res.ok) {
          const data = await res.json();
          setDone(true);
          setFeedback(data.feedback);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setIsEnding(false);
    }
  };

  const handleExitRoom = async () => {
    if (done) {
      router.push('/recruiter');
      return;
    }

    setIsEnding(true);
    if (confirm("Exiting the room will submit your current answers for final evaluation and close the assessment. You will not be able to re-enter. Do you want to proceed?")) {
      setLoading(true);
      try {
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            done: true
          })
        });
        if (res.ok) {
          const data = await res.json();
          setDone(true);
          setFeedback(data.feedback);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        router.push('/recruiter');
      }
    } else {
      setIsEnding(false);
    }
  };

  // Fullscreen Entry Consent view on load
  if (!fullscreenConsent) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-primary)',
        color: 'hsl(var(--text-primary))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: '24px'
      }}>
        <div style={{ maxWidth: '440px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <ShieldAlert size={48} style={{ color: 'hsl(var(--text-primary))' }} />
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700 }}>
            Enter Secure Session
          </h1>
          <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
            This interview runs in locked proctored fullscreen mode. Keyboard shortcuts are disabled. Exiting fullscreen or shifting tabs will flag your profile for evaluation.
          </p>
          <button
            onClick={async () => {
              try {
                if (!document.fullscreenElement) {
                  await document.documentElement.requestFullscreen();
                }
              } catch (e) {
                console.error(e);
              }
              setFullscreenConsent(true);
            }}
            style={{
              background: 'hsl(var(--text-primary))',
              color: 'hsl(var(--bg-primary))',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              marginTop: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Start Assessment & Lock Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'hsl(var(--bg-primary))', color: 'hsl(var(--text-primary))' }}>
      
      {/* Top Navigation Header */}
      <header className="no-print" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', zIndex: 10 }}>
        
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleExitRoom}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--text-secondary))',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              fontFamily: 'Outfit',
              fontWeight: 600
            }}
          >
            <ChevronLeft size={16} />
            Recruiter Portal
          </button>
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
              Candidate: <span style={{ color: 'hsl(var(--text-primary))' }}>{candidateProfile?.name || 'Loading...'}</span>
            </h2>
            <p style={{ fontSize: '10px', color: 'hsl(var(--text-secondary))' }}>Session: {sessionId}</p>
          </div>
        </div>

        {/* Right Section: Phases Timeline, End Option, Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          
          {/* Horizontal progress steps list */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600 }}>
            {['ICEBREAKER', 'STRENGTH_PROBE', 'GAP_PROBE', 'PROJECT_PROBE', 'BEHAVIORAL', 'WRAP_UP'].map((phaseName, index) => {
              const isCurrent = activePhase === phaseName;
              return (
                <React.Fragment key={phaseName}>
                  {index > 0 && <span style={{ color: 'rgba(128,128,128,0.25)' }}>/</span>}
                  <span 
                    style={{ 
                      color: isCurrent ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))',
                      fontWeight: isCurrent ? 700 : 500
                    }}
                  >
                    {phaseName.replace('_', ' ')}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* End Interview Option */}
            {!done && (
              <button
                onClick={handleEndInterview}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: 'hsl(var(--status-error))',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                End Interview
              </button>
            )}

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

        </div>
      </header>

      {/* Main Workspace (2-Column Layout) */}
      <div style={{ display: 'flex', flex: 1, width: '100%', maxWidth: '1440px', margin: '0 auto', gap: '20px', padding: '20px', overflow: 'hidden', height: 'calc(100vh - 80px)' }}>
        
        {!done ? (
          <>
            {/* Left Column: Scrolling chat history transcript */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', overflow: 'hidden' }}>
              
              {/* Message turns scrolling area */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingRight: '12px', marginBottom: '16px' }}>
                {messages.map((msg, idx) => {
                  if (msg.role === 'system') return null;
                  const isAssistant = msg.role === 'assistant';
                  
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px', 
                        width: '100%',
                        alignItems: isAssistant ? 'flex-start' : 'flex-end',
                        paddingLeft: isAssistant ? '0' : '48px',
                        paddingRight: isAssistant ? '48px' : '0'
                      }}
                    >
                      {isAssistant && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--accent-primary))', letterSpacing: '1px' }}>
                          <Cpu size={12} />
                          INTERVIEWER
                        </div>
                      )}
                      
                      <div className="glass-panel" style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: isAssistant ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'hsl(var(--text-primary))',
                        fontFamily: isAssistant && fontMapping ? fontMapping.fontFamily : 'inherit',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        width: '100%',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {isAssistant ? obfuscateText(msg.content, fontMapping) : msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Bottom typing input field */}
              <div style={{ width: '100%' }}>
                <ChatInputForm
                  onSendMessage={handleSendMessageDirectly}
                  loading={loading}
                  done={done}
                />
              </div>

            </div>

            {/* Right Column: SCRATCH WHITEBOARD */}
            <aside className="glass-panel" style={{ width: '340px', display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <Terminal size={16} />
                <h3 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Scratch Whiteboard
                </h3>
              </div>
              
              <ScratchWhiteboard
                initialValue={'// Whiteboard / Code Notepad\n// Use this workspace to outline database schemas, write SQL queries, or draft code.'}
              />
            </aside>
          </>
        ) : (
          /* Assessment Complete */
          <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-panel" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              width: '100%',
              maxWidth: '520px',
              minHeight: '280px',
              textAlign: 'center',
              gap: '16px',
              boxShadow: 'var(--glass-shadow)',
              borderRadius: '16px',
              background: 'var(--glass-bg)'
            }}>
              <CheckCircle2 size={48} style={{ color: 'hsl(var(--text-primary))' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>Assessment Complete</h3>
              <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                Thank you! Your responses have been uploaded to the Recruiter Dashboard for evaluation.
              </p>
              <button
                onClick={() => router.push('/recruiter')}
                className="neon-border-teal"
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'hsl(var(--text-primary))',
                  color: 'hsl(var(--bg-primary))',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginTop: '8px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
              >
                Return to Recruiter Dashboard
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Proctoring User Selection Restrictions & Custom Alert Overlays */}
      <style dangerouslySetInnerHTML={{ __html: `
        body, html {
          user-select: none !important;
        }
        input, textarea {
          user-select: text !important;
        }
      `}} />

      {/* Cheating Warning Intercept Overlay */}
      {!isLockedOut && cheatingAlertText && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.98)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            padding: '36px',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            background: '#1e293b',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <ShieldAlert size={48} style={{ color: '#ef4444' }} />
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Proctoring Security Violation
            </h2>
            <p style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
              {cheatingAlertText}
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              You have used {blurViolations + fullscreenViolations} of 2 warnings. A 3rd violation will terminate this interview.
            </p>
            
            <button
              onClick={async () => {
                try {
                  if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                  }
                  setCheatingAlertText(null);
                } catch (err) {
                  console.error('Failed to restore fullscreen:', err);
                  setCheatingAlertText("Fullscreen permission required. Please click this button to restore fullscreen and resume your interview.");
                }
              }}
              style={{
                background: '#f8fafc',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 28px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '8px',
                transition: 'background 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#cbd5e1'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
            >
              Acknowledge & Resume Secure Session
            </button>
          </div>
        </div>
      )}

      {/* Lockout Block Screen */}
      {isLockedOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.99)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px',
          textAlign: 'center',
          color: '#f8fafc'
        }}>
          <div style={{
            maxWidth: '520px',
            padding: '40px',
            border: '2px solid #ef4444',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            background: '#0f172a',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            <ShieldAlert size={64} style={{ color: '#ef4444' }} />
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Session Terminated
            </h1>
            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              This interview has been permanently locked due to reaching 3 proctoring violations (tab switches or fullscreen exits).
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Your recruiter has been notified of this security event.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                background: '#ef4444',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                padding: '14px 28px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '8px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Return Home
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
