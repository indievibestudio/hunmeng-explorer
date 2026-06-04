import React, { useState, useEffect } from 'react';
import type { LevelData } from '../types/game';
import PebbleBoard from './PebbleBoard';

interface ExploreScreenProps {
    campKey: string;
    levelData: LevelData[];
    onGoHome: () => void;
    onComplete: (campKey: string) => void;
}

const ExploreScreen: React.FC<ExploreScreenProps> = ({ campKey, levelData, onGoHome, onComplete }) => {
    const [stepIdx, setStepIdx] = useState(0);
    const [chosenPebbles, setChosenPebbles] = useState<number[]>([]);
    const [showNext, setShowNext] = useState(false);
    const [message, setMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [showOriginalHint, setShowOriginalHint] = useState(false);
    const [errorDots, setErrorDots] = useState<number[]>([]);

    // Web Audio API를 이용한 내장 신호음 생성 함수
    const playTone = (type: 'success' | 'failure' | 'click') => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;

        if (type === 'success') {
            // 청량한 띵동 소리 (500Hz -> 800Hz)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'failure') {
            // 나직한 경고음 (150Hz 삼각형파)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            // 가벼운 톡 소리 (600Hz)
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

    const node = levelData ? levelData[stepIdx] : null;

    useEffect(() => {
        if (!node) return;
        setChosenPebbles([]);
        setShowNext(false);
        setMessage(node.msg);
        setShowOriginalHint(false);
        setErrorDots([]);
    }, [stepIdx, node]);

    if (!levelData || !node) {
        return (
            <div className="screen active" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <p>데이터를 불러오는 중이거나 오류가 발생했습니다. 잠시만 기다려주세요...</p>
                <button onClick={onGoHome} className="pebble-btn">홈으로 돌아가기</button>
            </div>
        );
    }

    const getCampLabel = (key: string) => {
        if (key === 'first') return '첫소리 구역';
        if (key === 'middle') return '모음 연구실';
        return '받침 탐험 교실';
    };

    const handlePressPebble = (id: number) => {
        // 정답 체크 (선택하기 전 현재 상태 기준)
        const isTarget = node.dots.includes(id);
        const isBase = (campKey === 'middle' && node.base?.includes(id));

        if (!isTarget && !isBase && !node.isSpecialNotice && !node.isSpecial) {
            // 틀린 점을 누른 경우
            playTone('failure');
            setErrorDots([id]);
            setMessage("💡 가이드를 다시 읽고 올바른 위치에 조약돌을 충전해 보세요!");
            setTimeout(() => setErrorDots([]), 500); // 0.5초 후 빨간색 제거
            return;
        }

        let newPebbles: number[];
        if (chosenPebbles.includes(id)) {
            newPebbles = chosenPebbles.filter(x => x !== id);
        } else {
            newPebbles = [...chosenPebbles, id];
        }
        setChosenPebbles(newPebbles);

        // 1. 목표 정답과 일치하는지 체크 (모든 단계 공통)
        const matched = node.dots.length === newPebbles.length && node.dots.every(v => newPebbles.includes(v));
        
        if (matched && !node.isSpecial) {
            playTone('success');
            setMessage(`👏 정답이에요! '${node.char}'의 정확한 암호를 해독했습니다!`);
            setShowNext(true);
            return;
        }

        // 2. 특수 안내(시뮬레이터 등)는 무조건 다음 단계 버튼 활성화
        if (node.isSpecialNotice || node.isSpecial) {
            setShowNext(true);
            return;
        }

        // 3. 모음 학습 중 기준점(base) 입력 체크
        if (campKey === 'middle' && node.base) {
            const isBaseMatched = node.base.length === newPebbles.length && node.base.every(v => newPebbles.includes(v));
            if (isBaseMatched) {
                playTone('success');
                setMessage("🎯 기준점이 되는 모음을 잘 입력했습니다! 이제 레버를 당겨 마법을 부려보세요.");
            }
        }
    };

    // 점자 대칭 변환 로직
    const transformDots = (dots: number[], type: 'lr' | 'ud') => {
        const lrMap: Record<number, number> = { 1: 4, 4: 1, 2: 5, 5: 2, 3: 6, 6: 3 };
        const udMap: Record<number, number> = { 1: 3, 3: 1, 4: 6, 6: 4, 2: 2, 5: 5 };

        const map = type === 'lr' ? lrMap : udMap;
        return dots.map(d => map[d]);
    };

    const handlePullLever = (actionType: 'lr' | 'ud') => {
        playTone('click');

        // 모음 탐험 중 base/mirror 단계인 경우 특별 처리
        if (campKey === 'middle' && node.base && node.isMirror) {
            const isBaseMatched = node.base.length === chosenPebbles.length && node.base.every(v => chosenPebbles.includes(v));
            
            if (isBaseMatched) {
                // base가 정확히 입력된 상태에서 레버를 당기면 target(dots)으로 자동 변환
                setChosenPebbles([...node.dots]);
                playTone('success');
                setMessage(`👏 대단해요! 레버 마법을 이용해 정확한 모음 '${node.char}' 형태를 찾아냈습니다!`);
                setShowNext(true);
                return;
            } else {
                // base를 다 안 채웠는데 레버를 당긴 경우
                playTone('failure');
                setMessage("💡 가이드를 다시 읽고 먼저 기준이 되는 모음 조약돌을 충전해 보세요!");
                return;
            }
        }

        // 시뮬레이터 또는 일반 변환 (기존 로직)
        if (chosenPebbles.length === 0) {
            setMessage("💡 먼저 조약돌을 몇 개 켜보세요! 그래야 레버의 마법을 확인할 수 있어요.");
            return;
        }

        const nextPebbles = transformDots(chosenPebbles, actionType);
        setChosenPebbles(nextPebbles);

        if (actionType === 'lr') {
            setMessage("↔️ 좌우 반사 레버 작동! 점들이 거울을 본 것처럼 반대로 이동했습니다.");
        } else {
            setMessage("↕️ 위아래 뒤집기 레버 작동! 점들이 상하 반전되어 위치가 바뀌었습니다.");
        }

        // 변환 후 정답 여부 체크
        if (campKey === 'middle' && !node.isSpecialNotice) {
            const matched = node.dots.length === nextPebbles.length && node.dots.every(v => nextPebbles.includes(v));
            if (matched) {
                playTone('success');
                setMessage(`👏 대단해요! 레버 마법을 이용해 정확한 모음 '${node.char}' 형태를 찾아냈습니다!`);
                setShowNext(true);
            }
        }
    };

    const handleForwardStep = () => {
        playTone('click');
        if (stepIdx < levelData.length - 1) {
            setStepIdx(stepIdx + 1);
        } else {
            onComplete(campKey);
        }
    };

    return (
        <div id="screen-explore" className="screen active">
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
                                            [{getCampLabel(campKey)}] {node.char}
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
                                        ⛺ {stepIdx + 1} / {levelData.length} 단계
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
                                        width: `${((stepIdx + 1) / levelData.length) * 100}%`, 
                                        height: '100%', 
                                        background: '#81c784', 
                                        transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
                                    }} />
                                </div>
                            </div>
                            
                            <p className="npc-talk">{message}</p>

                            {(campKey === 'middle' && (node.isMirror || node.isSpecialNotice)) && (
                                <div className="mirror-lever-panel" style={{ marginTop: '2.5vh' }}>
                                    <button className="pebble-btn nature" onClick={() => handlePullLever('lr')}>좌우 반사 ↔️</button>
                                    <button className="pebble-btn nature" onClick={() => handlePullLever('ud')}>위아래 뒤집기 ↕️</button>
                                </div>
                            )}
                        </div>
                        <div className="game-controls">
                            {!showNext && !node.isSpecialNotice && !node.isSpecial && (
                                <button
                                    className="pebble-btn"
                                    onClick={() => {
                                        playTone('click');
                                        setShowOriginalHint(!showOriginalHint);
                                    }}
                                    style={{ 
                                        background: showOriginalHint ? '#78909c' : '#0288d1', 
                                        borderColor: showOriginalHint ? '#546e7a' : '#01579b' 
                                    }}
                                >
                                    {showOriginalHint ? "❌ 촉각 가이드 힌트 끄기" : "🔍 촉각 가이드 힌트 켜기"}
                                </button>
                            )}
                            {(showNext || node.isSpecialNotice || node.isSpecial) && (
                                <button
                                    className="pebble-btn"
                                    onClick={handleForwardStep}
                                    style={{ backgroundColor: '#4caf50', borderColor: '#2e7d32' }}
                                >
                                    {stepIdx === levelData.length - 1 ? "탐험 완료! 🏁" : "다음 단계로 ➔"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="right-panel">
                    <PebbleBoard
                        node={node}
                        chosenPebbles={chosenPebbles}
                        onPressPebble={handlePressPebble}
                        showHint={showOriginalHint}
                        errorDots={errorDots}
                    />
                </div>
            </div>

            {showConfirm && (
                <div className="passport-modal active">
                    <div className="passport-card">
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '2vh' }}>잠시만요! ✋</h2>
                        <div className="passport-msg" style={{ textAlign: 'center', marginBottom: '3vh' }}>
                            지금 홈 화면으로 돌아가면 지금까지의 학습 진행 상황이 사라집니다.<br/>
                            정말 탐험을 중단하고 돌아가시겠습니까?
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

export default ExploreScreen;
