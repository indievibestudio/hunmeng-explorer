import React, { useState } from 'react';

interface CertificateModalProps {
    isActive: boolean;
    onDismiss: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({ isActive, onDismiss }) => {
    const [name, setName] = useState('');

    const generateAndSaveCertificate = () => {
        const nickname = name.trim();
        if (!nickname) {
            alert("주민증에 새겨질 대원의 이름을 입력해 주세요!");
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 850;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#fffdf9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Patterns
        ctx.strokeStyle = 'rgba(141, 110, 99, 0.03)';
        ctx.lineWidth = 2;
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 40) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
        }

        // Borders
        ctx.strokeStyle = '#cfb53b';
        ctx.lineWidth = 12;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#3e2723';

        // Title
        ctx.font = 'bold 50px "Malgun Gothic"';
        ctx.fillText('훈맹정음 명예 주민증', canvas.width / 2, 160);

        ctx.font = 'bold 22px "Malgun Gothic"';
        ctx.fillStyle = '#8d6e63';
        ctx.fillText('✨ 훈맹정음 비밀 탐험대 명예의 전당', canvas.width / 2, 220);

        ctx.strokeStyle = '#d7ccc8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 150, 250);
        ctx.lineTo(canvas.width / 2 + 150, 250);
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#3e2723';
        ctx.font = 'bold 32px "Malgun Gothic"';
        ctx.fillText(`성 명: ${nickname} 탐험대원`, 120, 340);

        ctx.font = '24px "Malgun Gothic"';
        ctx.fillStyle = '#5d4037';
        const msg = "위 사람은 송암 박두성 선생님이 창제한 우리말 점자 '훈맹정음'의 위대한 기준점 원리, 거울처럼 뒤집히는 대칭 마법, 그리고 자리가 바뀌는 이사 규칙의 모든 비밀을 완벽하게 찾아내고 최종 자격시험을 훌륭하게 통과하였으므로 명예 훈맹정음 비밀 탐험대 마스터로 임명하며 본 인증서를 수여합니다.";

        const maxWidth = canvas.width - 240;
        const words = msg.split(' ');
        let line = '';
        let y = 420;
        const lineHeight = 45;

        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, 120, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, 120, y);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#8d6e63';
        ctx.font = 'bold 24px "Malgun Gothic"';

        const today = new Date();
        const dateString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
        ctx.fillText(dateString, canvas.width / 2, 690);

        ctx.fillStyle = '#3e2723';
        ctx.font = 'bold 30px "Malgun Gothic"';
        ctx.fillText('훈맹정음 비밀 탐험대 본부', canvas.width / 2, 750);

        const imageURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = `${nickname}_훈맹정음_명예주민증.png`;
        downloadLink.click();

        alert(`🏅 축하합니다! ${nickname} 대원님의 명예 주민증이 고해상도 상장 이미지(PNG)로 갤러리/다운로드 폴더에 안전하게 저장되었습니다!`);
        onDismiss();
    };

    return (
        <div className={`passport-modal ${isActive ? 'active' : ''}`}>
            <div className="passport-card">
                <div>
                    <h2 style={{ color: 'var(--primary-dark)' }}>명예 주민 인증서</h2>
                    <div style={{ fontSize: '1rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '2vh' }}>✨ 훈맹정음 비밀 탐험대 명예의 전당</div>
                    <input 
                        type="text" 
                        className="islander-name-input" 
                        placeholder="탐험대원 이름 입력" 
                        maxLength={8}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className="passport-msg">
                        위 사람은 송암 박두성 선생님이 창제한 우리말 점자 '훈맹정음'의 위대한 기준점 원리, 거울처럼 뒤집히는 대칭 마법, 그리고 자리가 바뀌는 이사 규칙의 모든 비밀을 완벽하게 찾아내고 최종 자격시험을 훌륭하게 통과하였으므로 명예 훈맹정음 비밀 탐험대 마스터로 임명하며 본 인증서를 수여합니다.
                    </div>
                </div>
                <div className="game-controls" style={{ justifyContent: 'center', gap: '1.5vw' }}>
                    <button 
                        className="pebble-btn" 
                        onClick={generateAndSaveCertificate}
                        style={{ 
                            background: '#ffb300', 
                            borderColor: '#ff8f00', 
                            color: '#3e2723',
                            whiteSpace: 'nowrap',
                            minWidth: '160px',
                            paddingLeft: '24px',
                            paddingRight: '24px'
                        }}
                    >
                        🥇 상장 이미지 저장하기
                    </button>
                    <button 
                        className="pebble-btn stone" 
                        onClick={onDismiss}
                        style={{ 
                            whiteSpace: 'nowrap',
                            minWidth: '160px',
                            paddingLeft: '24px',
                            paddingRight: '24px'
                        }}
                    >
                        마을로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
