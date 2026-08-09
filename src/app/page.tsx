'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Brain, Award, Play, ChevronRight, HelpCircle, 
  MessageSquare, Shield, Clock, BookOpen, Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const faqs = [
    {
      q: "How does the AI Planner design the interview agenda?",
      a: "The Planner scans the candidate's historical cohort activity data (commit consistency, mission completion rates, first-try milestones) and checks it against the curriculum modules to design a highly tailored, topic-specific interview syllabus covering their exact strengths and development gaps."
    },
    {
      q: "What proctoring controls are activated during the session?",
      a: "To ensure exam integrity, the system locks the browser into fullscreen mode, blocks window focusing/tab switching, intercepts devtools (F12) and shortcut keys (copy, paste, cut), and runs a 200ms character pace proctor that detects and reverts text block pasting from external AI assistants or clipboards."
    },
    {
      q: "Can the candidate use their voice during the interview?",
      a: "Yes! The candidate interface integrates the HTML5 Web Speech API, allowing the candidate to toggle 'Speak' mode, enabling voice capture (speech-to-text) and reading back the AI interviewer's questions (text-to-speech) out loud."
    },
    {
      q: "Who evaluates the candidates and writes the final summary?",
      a: "An Evaluator Agent grades the technical accuracy and conceptual coverage of each conversation turn. Once the session ends, the Synthesizer Agent aggregates all diagnostics, calculates an overall rating (out of 5.0 stars), outlines core strengths and gaps, and matches them to modules in the curriculum."
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
      backgroundImage: 'linear-gradient(rgba(10, 15, 30, 0.88), rgba(10, 15, 30, 0.94)), url(/home_bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      
      {/* Navigation Header */}
      <header style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '24px auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 10
      }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px', color: '#ffffff' }}>
          ABTalks
        </span>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1000px', width: '100%', margin: '60px auto 40px auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        

        <h1 style={{
          fontFamily: 'Outfit',
          fontSize: '56px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          color: '#ffffff',
          maxWidth: '800px',
          marginTop: '8px'
        }}>
          The Intelligent Agent for{' '}
          <span style={{
            background: 'linear-gradient(135deg, #ffffff, #999999)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Technical Cohort Recruiting
          </span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: '620px',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Verify technical capacity with an automated interviewer. Aggregates candidate Github activity and dynamic curriculum guides to conduct strict proctored assessments.
        </p>

        {/* CTA Actions */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button
            onClick={() => router.push('/recruiter')}
            className="neon-border-teal"
            style={{
              padding: '14px 28px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#000000',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            Launch Recruiter Hub
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Floating Cards (Visual Graphic) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          width: '100%',
          maxWidth: '900px',
          marginTop: '60px'
        }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffffff'
            }}>
              <Brain size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>1. AI Planning</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
              Generates customized syllabi dynamically based on candidate GitHub metrics and course modules.
            </p>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffffff'
            }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>2. Active Proctoring</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
              Enforces locked fullscreen, tab blurring bans, keyboard shortcut locking, and pasting rate limits.
            </p>
          </div>

          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#ffffff'
            }}>
              <Award size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>3. Star Grading</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
              Summarizes technical accuracy and conceptual matches to generate out of 5 stars ratings and PDF summaries.
            </p>
          </div>
        </div>

        {/* Timeline Stats Block */}
        <div style={{
          width: '100%',
          maxWidth: '900px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>31 Days</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Cohort Course Duration</span>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}></div>
          <div>
            <span style={{ display: 'block', fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>4 Phases</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Interview Orchestration</span>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}></div>
          <div>
            <span style={{ display: 'block', fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>&lt; 2.5s</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Real-time Response Latency</span>
          </div>
        </div>

        {/* FAQs */}
        <div style={{ width: '100%', maxWidth: '720px', marginTop: '64px', textAlign: 'left' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '24px', color: '#ffffff' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel" 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>
                  <span>{faq.q}</span>
                  <ChevronRight size={16} style={{ 
                    transform: activeFaq === idx ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                    color: '#ffffff'
                  }} />
                </div>
                {activeFaq === idx && (
                  <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px', animation: 'fadeIn 0.2s ease-out' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '1200px',
        width: '100%',
        margin: 'auto auto 24px auto',
        padding: '24px 0 0 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)'
      }}>
        <span>&copy; 2026 ABTalks AI Agent. All Rights Reserved.</span>
        <span>Autonomous Technical Recruiting</span>
      </footer>

    </div>
  );
}
