import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './components/HomeScreen';
import ExploreScreen from './components/ExploreScreen';
import QuizScreen from './components/QuizScreen';
import WordAssemblyScreen from './components/WordAssemblyScreen';
import CertificateModal from './components/CertificateModal';
import { levelDatabase } from './data/levels';
import { islandQuizBank } from './data/quizzes';
import type { BadgePassport } from './types/game';

// 화면 타입을 명확하게 정의하여 꼬임 방지
type ScreenType = 'home' | 'explore' | 'quiz' | 'assembly';

const App: React.FC = () => {
    const [screen, setScreen] = useState<ScreenType>('home');
    const [activeCamp, setActiveCamp] = useState<string>('');
    const [badges, setBadges] = useState<BadgePassport>({ first: false, middle: false, last: false });
    const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

    // 공통: 홈으로 돌아가기
    const handleGoHome = () => {
        setScreen('home');
    };

    // 대시보드에서 각 구역 진입 제어
    const handleLaunchCamp = (campKey: string) => {
        if (campKey === 'wordAssembly') {
            setScreen('assembly');
        } else {
            setActiveCamp(campKey);
            setScreen('explore');
        }
    };

    // 탐험 완료 후 퀴즈(복습) 화면으로 이동
    const handleExploreComplete = () => {
        setScreen('quiz');
    };

    // 퀴즈 완료 후 처리 (스탬프 부여 또는 상장 수여)
    const handleQuizComplete = (mode: 'single' | 'final', campKey: string) => {
        if (mode === 'single') {
            setBadges(prev => ({ ...prev, [campKey]: true }));
            alert("🎉 축하합니다! 해당 탐험 구역 스탬프를 획득하셨습니다!");
            setScreen('home');
        } else {
            setIsFinalModalOpen(true);
        }
    };

    // 명예의 전당 (최종 시험) 진입 제어
    const handleLaunchFinal = () => {
        if (badges.first && badges.middle && badges.last) {
            setActiveCamp('final');
            setScreen('quiz');
        } else {
            alert("🔒 아직 문이 열리지 않았어요! 세 가지 관문을 모두 돌파해 스탬프 3개를 모아주세요!");
        }
    };

    return (
        <div className="app-container">
            {/* 상단 헤더 */}
            <Header onGoHome={handleGoHome} badges={badges} />
            
            {/* 메인 콘텐츠 영역 (조건부 렌더링) */}
            <main>
                {/* 1. 메인 홈 화면 */}
                {screen === 'home' && (
                    <HomeScreen 
                        badges={badges} 
                        onLaunchCamp={handleLaunchCamp} 
                        onLaunchFinal={handleLaunchFinal} 
                        onLaunchSampleModal={() => setIsFinalModalOpen(true)}
                    />
                )}
                
                {/* 2. 각 구역별 탐험(학습) 화면 */}
                {screen === 'explore' && (
                    <ExploreScreen 
                        campKey={activeCamp} 
                        levelData={levelDatabase[activeCamp]} 
                        onGoHome={handleGoHome}
                        onComplete={handleExploreComplete}
                    />
                )}
                
                {/* 3. 복습 테스트 및 최종 시험 화면 */}
                {screen === 'quiz' && (
                    <QuizScreen 
                        mode={activeCamp === 'final' ? 'final' : 'single'} 
                        campKey={activeCamp}
                        quizzes={islandQuizBank[activeCamp]}
                        onGoHome={handleGoHome}
                        onComplete={handleQuizComplete}
                    />
                )}

                {/* 4. 새로 추가된 단어 조립 학습 화면 */}
                {screen === 'assembly' && (
                    <WordAssemblyScreen 
                        onGoHome={handleGoHome}
                        onComplete={() => {
                            alert("🎊 와우! 모든 단어를 완벽하게 조립하셨습니다. 당신은 이제 단어 조립 마스터!");
                            handleGoHome();
                        }}
                    />
                )}
            </main>

            {/* 하단 푸터 */}
            <Footer />

            {/* 최종 상장 팝업 */}
            <CertificateModal 
                isActive={isFinalModalOpen} 
                onDismiss={() => {
                    setIsFinalModalOpen(false);
                    setScreen('home');
                }} 
            />
        </div>
    );
};

export default App;
