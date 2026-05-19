import React, { useState, useRef, useEffect } from 'react';
import './TerminalContact.css';
import { playKeySound } from '../utils/SoundManager';

const TerminalContact = () => {
  const [history, setHistory] = useState([
    { type: 'output', text: 'HỆ THỐNG GIAO TIẾP KÍCH HOẠT...' },
    { type: 'output', text: 'Gõ "help" để xem danh sách lệnh.' }
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!input.trim()) return;
      playKeySound();
      processCommand(input.trim());
      setInput('');
    }
  };

  const processCommand = (cmd) => {
    const newHistory = [...history, { type: 'input', text: `$ ${cmd}` }];
    
    const [command, ...args] = cmd.toLowerCase().split(' ');
    const argStr = args.join(' ');

    switch (command) {
      case 'help':
        newHistory.push({ type: 'output', text: 'Các lệnh khả dụng:' });
        newHistory.push({ type: 'output', text: '  help    - Hiển thị danh sách này' });
        newHistory.push({ type: 'output', text: '  about   - Thông tin cá nhân' });
        newHistory.push({ type: 'output', text: '  skills  - Các kỹ năng' });
        newHistory.push({ type: 'output', text: '  clear   - Xóa màn hình' });
        newHistory.push({ type: 'output', text: '  contact [nội_dung] - Gửi tin nhắn cho Dev' });
        break;
      case 'about':
        newHistory.push({ type: 'output', text: 'Hệ thống: CANH.EXE' });
        newHistory.push({ type: 'output', text: 'Chức năng: Fullstack Developer.' });
        newHistory.push({ type: 'output', text: 'Đam mê phong cách Cyberpunk và Retro.' });
        break;
      case 'skills':
        newHistory.push({ type: 'output', text: '> FRONTEND: React, Next.js, Tailwind, Framer Motion' });
        newHistory.push({ type: 'output', text: '> BACKEND: Node.js, PostgreSQL, Redis' });
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'contact':
        if (!argStr) {
          newHistory.push({ type: 'error', text: 'Lỗi: Thiếu nội dung tin nhắn. Cú pháp: contact [nội_dung]' });
        } else {
          newHistory.push({ type: 'output', text: 'Đang mã hóa dữ liệu...' });
          setHistory(newHistory);
          // Simulate sending
          setTimeout(() => {
            setHistory(prev => [
              ...prev, 
              { type: 'output', text: 'Kết nối an toàn thiết lập xong.' },
              { type: 'output', text: `[THÀNH CÔNG] Tin nhắn "${argStr}" đã được gửi tới hệ thống lõi!` }
            ]);
            playKeySound(); // Play sound when message is successfully sent
          }, 1500);
          return;
        }
        break;
      case 'sudo':
        newHistory.push({ type: 'error', text: 'Quyền truy cập bị từ chối: Sự cố vi phạm bảo mật đã được ghi nhận.' });
        break;
      case 'ping':
        newHistory.push({ type: 'output', text: 'Pong! Kết nối tới CANH.EXE ổn định (24ms).' });
        break;
      default:
        newHistory.push({ type: 'error', text: `Lệnh không hợp lệ: ${command}. Gõ "help" để xem trợ giúp.` });
    }
    setHistory(newHistory);
  };

  return (
    <div 
      className="terminal-container" 
      onClick={(e) => {
        e.stopPropagation();
        document.getElementById('terminal-input').focus();
      }}
    >
      <div className="terminal-history">
        {history.map((line, i) => (
          <div key={i} className={`terminal-line ${line.type}`}>
            {line.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="terminal-input-wrapper">
        <span>$</span>
        <input
          id="terminal-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default TerminalContact;
