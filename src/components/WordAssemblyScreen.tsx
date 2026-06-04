import React, { useState, useEffect } from 'react';
import { wordAssemblyDatabase } from '../data/wordAssembly';
import type { AssemblyWord } from '../data/wordAssembly';
import PebbleBoard from './PebbleBoard';

interface WordAssemblyScreenProps {
    onGoHome: () => void;
    onComplete: () => void;
}

const WordAssemblyScreen: React.FC<WordAssemblyScreenProps> = ({ onGoHome, onComplete }) => {
    const [wordIdx, setWordIdx] = useState(0);
    const [stepIdx, setStepIdx] = useState(0);
    const [chosenPebbles, setChosenPebbles] = useState<number[]>([]);
    const [showNext, setShowNext] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorDots, setErrorDots] = useState<number[]>([]);

    const currentWord: AssemblyWord = wordAssemblyDatabase[wordIdx];
    const currentNode = currentWord.steps[stepIdx];

    // Web Audio API를 이용한 내장 신호음 생성 함수
    const playTone = (type: 'success' | 'failure' | 'click') => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
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

    // 스텝이 바뀔 때 초기화
    useEffect(() => {
        setChosenPebbles([]);
        setErrorDots([]);
        setShowHint(false);
        
        // ㅇ 생략 규칙 (빈 배열)인 경우 즉시 다음 버튼 활성화
        if (currentNode.dots.length === 0) {
            setShowNext(true);
        } else {
            setShowNext(false);
        }
    }, [wordIdx, stepIdx, currentNode]);

    const handlePressPebble = (id: number) => {
        if (showNext) return; // 이미 정답을 맞췄으면 클릭 무시

        const isCorrectTarget = currentNode.dots.includes(id);

        if (!isCorrectTarget) {
            playTone('failure');
            setErrorDots([id]);
            setTimeout(() => setErrorDots([]), 500);
            return;
        }

        let newPebbles: number[];
        if (chosenPebbles.includes(id)) {
            newPebbles = chosenPebbles.filter(x => x !== id);
        } else {
            newPebbles = [...chosenPebbles, id];
        }
        setChosenPebbles(newPebbles);

        // 정답 체크
        const matched = currentNode.dots.length === newPebbles.length && 
                        currentNode.dots.every(v => newPebbles.includes(v));
        
        if (matched) {
            playTone('success');
            setShowNext(true);
            setShowHint(false);
        }
    };

    const handleNextStep = () => {
        playTone('click');
        if (stepIdx < currentWord.steps.length - 1) {
            setStepIdx(stepIdx + 1);
        } else if (wordIdx < wordAssemblyDatabase.length - 1) {
            setWordIdx(wordIdx + 1);
            setStepIdx(0);
        } else {
            onComplete();
        }
    };

    const handlePrevStep = () => {
        playTone('click');
        if (stepIdx > 0) {
            setStepIdx(stepIdx - 1);
        } else if (wordIdx > 0) {
            const prevWord = wordAssemblyDatabase[wordIdx - 1];
            setWordIdx(wordIdx - 1);
            setStepIdx(prevWord.steps.length - 1);
        }
    };

    return (
        <div id="screen-word-assembly" className="screen active">
            <div className="split-container">
                <div className="left-panel">
                    <div className="dialog-box">
                        <div style={{ position: 'relative' }}>
                            <div style={{ marginBottom: '2vh' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5vh' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button 
                                            onClick={() => {
                                                playTone('click');
                                                setShowConfirm(true);
                                            }}
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
                                        <h2 style={{ color: 'var(--primary-dark)', margin: 0, fontSize: 'clamp(1.1rem, 2.5vh, 1.5rem)' }}>
                                            [단어 조립] {currentWord.word} {currentWord.icon}
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
                                        📦 {wordIdx + 1} / {wordAssemblyDatabase.length} 단어
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
                                        width: `${((wordIdx) / wordAssemblyDatabase.length) * 100 + ((stepIdx + 1) / (currentWord.steps.length * wordAssemblyDatabase.length)) * 100}%`, 
                                        height: '100%', 
                                        background: '#64b5f6', 
                                        transition: 'width 0.4s ease' 
                                    }} />
                                </div>
                            </div>

                            <div style={{ 
                                background: '#e3f2fd', 
                                padding: '1.5vh 2vw', 
                                borderRadius: '16px', 
                                marginBottom: '2vh',
                                border: '2px solid #90caf9',
                                display: 'inline-block'
                            }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1565c0' }}>
                                    현재 조립 중: {currentNode.letter} ({currentNode.partName})
                                </span>
                            </div>
                            
                            <p className="npc-talk" style={{ minHeight: '12vh' }}>{currentNode.msg}</p>
                        </div>

                        <div className="game-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1.5vh' }}>
                            {!showNext && currentNode.dots.length > 0 && (
                                <button
                                    className="pebble-btn"
                                    onClick={() => {
                                        playTone('click');
                                        setShowHint(!showHint);
                                    }}
                                    style={{ 
                                        background: showHint ? '#78909c' : '#0288d1', 
                                        borderColor: showHint ? '#546e7a' : '#01579b',
                                        width: 'fit-content'
                                    }}
                                >
                                    {showHint ? "❌ 힌트 가이드 끄기" : "💡 힌트 가이드 보기"}
                                </button>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <button
                                    className="pebble-btn stone"
                                    onClick={handlePrevStep}
                                    disabled={wordIdx === 0 && stepIdx === 0}
                                    style={{ opacity: (wordIdx === 0 && stepIdx === 0) ? 0.5 : 1 }}
                                >
                                    ⬅ 이전 단계
                                </button>
                                
                                {(showNext || currentNode.dots.length === 0) && (
                                    <button
                                        className="pebble-btn"
                                        onClick={handleNextStep}
                                        style={{ backgroundColor: '#4caf50', borderColor: '#2e7d32' }}
                                    >
                                        { (wordIdx === wordAssemblyDatabase.length - 1 && stepIdx === currentWord.steps.length - 1) 
                                            ? "조립 완료! 🏁" 
                                            : "다음 단계로 ➔" 
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="right-panel" style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ margin: 0, padding: 0 }}>
                        <PebbleBoard
                            node={{...currentNode, base: showHint ? currentNode.dots : []}}
                            chosenPebbles={chosenPebbles}
                            onPressPebble={handlePressPebble}
                            showHint={showHint}
                            errorDots={errorDots}
                        />
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="passport-modal active">
                    <div className="passport-card">
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2vh' }}>잠시만요! ✋</h2>
                        <div className="passport-msg" style={{ textAlign: 'center', marginBottom: '3vh' }}>
                            지금 홈 화면으로 돌아가면 조립 중인 단어 정보가 사라집니다.<br/>
                            정말 탐험을 중단하고 돌아가시겠습니까?
                        </div>
                        <div className="game-controls" style={{ justifyContent: 'center' }}>
                            <button 
                                className="pebble-btn" 
                                onClick={() => onGoHome()}
                                style={{ background: '#e57373', borderColor: '#d32f2f' }}
                            >
                                네, 돌아갈래요
                            </button>
                            <button 
                                className="pebble-btn stone" 
                                onClick={() => setShowConfirm(false)}
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

export default WordAssemblyScreen;
