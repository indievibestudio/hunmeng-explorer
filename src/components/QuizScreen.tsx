import React, { useState, useEffect, useMemo } from 'react';
import type { QuizUnit } from '../types/game';
import PebbleBoard from './PebbleBoard';

interface QuizScreenProps {
    mode: 'single' | 'final';
    campKey: string;
    quizzes: QuizUnit[];
    onGoHome: () => void;
    onComplete: (mode: 'single' | 'final', campKey: string) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ mode, campKey, quizzes, onGoHome, onComplete }) => {
    const [currentQuizzes, setCurrentQuizzes] = useState<QuizUnit[]>([]);
    const [qIdx, setQIdx] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // 문제 셔플 및 5문제 추출 함수
    const setupQuizzes = () => {
        const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);
        setCurrentQuizzes(selected);
        setQIdx(0);
        setShowHint(false);
    };

    // 컴포넌트 진입 시 또는 구역이 바뀔 때 문제 셋 세팅
    useEffect(() => {
        setupQuizzes();
    }, [campKey, quizzes]);

    // Web Audio API를 이용한 내장 신호음 생성 함수
    const playTone = (type: 'success' | 'failure' | 'click') => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'failure') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.onended = () => ctx.close();
    };

    // 현재 문제가 세팅되지 않았으면 대기 (안정성 확보)
    if (currentQuizzes.length === 0) return null;

    const qUnit = currentQuizzes[qIdx];

    const handleAuditAnswer = (userChoice: number) => {
        if (userChoice === qUnit.correct) {
            playTone('success');
            alert("정답입니다! 훌륭해요.");
            if (qIdx < currentQuizzes.length - 1) {
                setQIdx(qIdx + 1);
            } else {
                onComplete(mode, campKey);
            }
        } else {
            playTone('failure');
            alert("오답입니다! '반딧불이 힌트'를 확인해 보세요.");
        }
    };

    return (
        <div id="screen-quiz" className="screen active">
            <div className="split-container">
                <div className="left-panel">
                    <div className="dialog-box">
                        <div style={{ position: 'relative' }}>
                            <div style={{ marginBottom: '2vh' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5vh' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button 
                                            onClick={() => setShowConfirm(true)}
                                            style={{
                                                background: '#f5f5f5',
                                                border: '2px solid #ddd',
                                                borderRadius: '12px',
                                                padding: '6px 12px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold',
                                                color: '#666',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            🏠 홈으로
                                        </button>
                                        <h2 style={{ color: 'var(--accent-orange)', margin: 0, fontSize: 'clamp(1.1rem, 2.5vh, 1.5rem)' }}>
                                            {mode === 'final' ? '👑 명예 마스터 종합 시험' : '⚙️ 복습 테스트'}
                                        </h2>
                                    </div>
                                    <span style={{ 
                                        fontWeight: 'bold', 
                                        color: 'var(--text-sub)', 
                                        fontSize: '1rem',
                                        background: '#f9f9f9',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        border: '1px solid #eee'
                                    }}>
                                        📝 {qIdx + 1} / {currentQuizzes.length} 문제
                                    </span>
                                </div>
                                <div style={{ 
                                    width: '100%', 
                                    height: '10px', 
                                    background: '#e0e0e0', 
                                    borderRadius: '5px', 
                                    overflow: 'hidden' 
                                }}>
                                    <div style={{ 
                                        width: `${((qIdx + 1) / currentQuizzes.length) * 100}%`, 
                                        height: '100%', 
                                        background: '#ff9800', 
                                        transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                                    }} />
                                </div>
                            </div>
                            
                            <p className="npc-talk" style={{ marginBottom: '2.5vh' }}>{qUnit.q}</p>
                            <div className="wood-option-box">
                                {qUnit.a.map((opt, idx) => (
                                    <div
                                        key={`${qIdx}-${idx}`}
                                        className="wood-option"
                                        onClick={() => handleAuditAnswer(idx)}
                                    >
                                        {idx + 1}. {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="game-controls">
                            <button
                                className="pebble-btn"
                                style={{ background: '#0288d1', borderColor: '#01579b' }}
                                onClick={() => {
                                    playTone('click');
                                    setShowHint(true);
                                }}
                            >
                                반딧불이 힌트 💡
                            </button>
                        </div>
                    </div>
                </div>
                <div className="right-panel">
                    <PebbleBoard
                        chosenPebbles={[]}
                        isQuiz
                    />
                </div>
            </div>

            {showHint && (
                <div className="passport-modal active">
                    <div className="passport-card">
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2vh' }}>반딧불이의 도움 💡</h2>
                        <div className="passport-msg" style={{ textAlign: 'center', marginBottom: '3vh' }}>
                            {qUnit.hint || "이 문제에 대한 힌트가 준비되지 않았습니다."}
                        </div>
                        <div className="game-controls" style={{ justifyContent: 'center' }}>
                            <button 
                                className="pebble-btn" 
                                onClick={() => {
                                    playTone('click');
                                    setShowHint(false);
                                }}
                                style={{ background: '#4caf50', borderColor: '#2e7d32' }}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="passport-modal active">
                    <div className="passport-card">
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2vh' }}>잠시만요! ✋</h2>
                        <div className="passport-msg" style={{ textAlign: 'center', marginBottom: '3vh' }}>
                            지금 돌아가면 이 테스트의 진행 상황이 모두 사라집니다.<br/>
                            정말 중단하고 홈으로 돌아가시겠습니까?
                        </div>
                        <div className="game-controls" style={{ justifyContent: 'center' }}>
                            <button 
                                className="pebble-btn" 
                                onClick={() => {
                                    playTone('click');
                                    onGoHome();
                                }}
                                style={{ background: '#e57373', borderColor: '#d32f2f' }}
                            >
                                네, 돌아갈래요
                            </button>
                            <button 
                                className="pebble-btn stone" 
                                onClick={() => {
                                    playTone('click');
                                    setShowConfirm(false);
                                }}
                            >
                                아니요, 계속할래요
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizScreen;
