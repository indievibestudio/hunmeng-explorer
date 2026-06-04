import React from 'react';
import type { LevelData } from '../types/game';

interface PebbleBoardProps {
    node?: LevelData;
    chosenPebbles: number[];
    onPressPebble?: (id: number) => void;
    isQuiz?: boolean;
    showHint?: boolean;
    errorDots?: number[];
}

const PebbleBoard: React.FC<PebbleBoardProps> = ({
    node,
    chosenPebbles,
    onPressPebble,
    isQuiz,
    showHint,
    errorDots = []
}) => {
    const dotIds = [1, 4, 2, 5, 3, 6];

    const getDotClass = (id: number) => {
        let classes = 'pebble-dot';

        if (isQuiz) {
            return classes;
        }

        // 1. 오답 입력 시 빨간색 깜빡임 효과
        if (errorDots.includes(id)) {
            classes += ' error-flash';
        }

        // 2. 선택된 점은 active (진한 주황색/초록색)
        const isActive = chosenPebbles.includes(id);
        if (isActive) {
            classes += ' active';
        }

        if (node) {
            // 3. 힌트 버튼을 눌렀을 때만 가이드용 점선 (original 또는 base) 표시
            const isGuide = node.original?.includes(id) || node.base?.includes(id);
            if (showHint && isGuide && !isActive) {
                classes += ' dot-ghost';
            }
        }

        return classes;
    };

    return (
        <div className="pebble-board" style={isQuiz ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            {dotIds.map(id => (
                <div
                    key={id}
                    className={getDotClass(id)}
                    onClick={() => onPressPebble?.(id)}
                >
                    {id}
                </div>
            ))}
        </div>
    );
};

export default PebbleBoard;
