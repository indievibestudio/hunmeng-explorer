import React from 'react';
import type { BadgePassport } from '../types/game';

interface HeaderProps {
    onGoHome: () => void;
    badges: BadgePassport;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, badges }) => {
    return (
        <header>
            <h1 onClick={onGoHome} style={{ cursor: 'pointer' }}>손끝 한글 : 훈맹정음 탐험대</h1>
        </header>
    );
};

export default Header;
