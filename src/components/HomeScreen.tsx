import React from 'react';
import type { BadgePassport } from '../types/game';

interface HomeScreenProps {
    badges: BadgePassport;
    onLaunchCamp: (camp: string) => void;
    onLaunchFinal: () => void;
    onLaunchSampleModal: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ badges, onLaunchCamp, onLaunchFinal, onLaunchSampleModal }) => {
    const isFinalUnlocked = badges.first && badges.middle && badges.last;

    return (
        <div id="screen-home" className="screen active">
            <div className="island-map">
                {/* 메뉴 1: 첫소리 */}
                <div className={`landmark-card ${badges.first ? 'completed' : ''}`} onClick={() => onLaunchCamp('first')}>
                    <div className="avatar">🧭</div>
                    <h3>첫소리 탐험 구역</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.5vh' }}>모든 자음의 뿌리, 기준점 찾기</p>
                    {badges.first && <div className="mission-complete-tag">✅ 미션 완료!</div>}
                </div>

                {/* 메뉴 2: 모음 */}
                <div className={`landmark-card ${badges.middle ? 'completed' : ''}`} onClick={() => onLaunchCamp('middle')}>
                    <div className="avatar">🪞</div>
                    <h3>모음 탐험 구역</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.5vh' }}>양옆으로 뒤집히는 거울 마법</p>
                    {badges.middle && <div className="mission-complete-tag">✅ 미션 완료!</div>}
                </div>

                {/* 메뉴 3: 받침 */}
                <div className={`landmark-card ${badges.last ? 'completed' : ''}`} onClick={() => onLaunchCamp('last')}>
                    <div className="avatar">🛝</div>
                    <h3>받침 탐험 구역</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.5vh' }}>왼쪽으로, 아래로! 이사 가는 자음들</p>
                    {badges.last && <div className="mission-complete-tag">✅ 미션 완료!</div>}
                </div>

                {/* 메뉴 4: 단어 조립 (NEW) */}
                <div 
                    className="landmark-card" 
                    onClick={() => onLaunchCamp('wordAssembly')}
                >
                    <div className="avatar">🧩</div>
                    <h3>단어 조립 구역</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.5vh' }}>흩어진 초성·모음·받침을 하나로 합치기!</p>
                </div>

                {/* 메뉴 5: 명예의 전당 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
                    <div
                        className={`landmark-card ${isFinalUnlocked ? '' : 'locked'}`}
                        onClick={onLaunchFinal}
                        style={{ width: '100%' }}
                    >
                        <div className="avatar">👑</div>
                        <h3>명예의 전당</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '0.5vh' }}>훈맹정음 최종 자격시험</p>
                    </div>
                    <button 
                        className="pebble-btn stone" 
                        style={{ 
                            padding: '1.2vh', 
                            fontSize: '0.85rem', 
                            borderRadius: '14px',
                            borderBottomWidth: '3px'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onLaunchSampleModal();
                        }}
                    >
                        👀 상장 샘플 발급해보기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
