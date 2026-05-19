import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Cpu, Mail, Ghost, Zap, ExternalLink, Sun, Moon, Settings } from 'lucide-react';
import CyberpunkCity from './components/CyberpunkCity';
import PixelCard from './components/PixelCard';
import Typewriter from './components/Typewriter';
import LetterIntro from './components/LetterIntro';
import PixelModal from './components/PixelModal';
import { playKeySound, startRain, stopRain } from './utils/SoundManager';
import Crows from './components/Crows';
import CyberAvatar from './components/CyberAvatar';
import CursorTrail from './components/CursorTrail';
import CustomCursor from './components/CustomCursor';
import MatrixBackground from './components/MatrixBackground';
import avatar1 from './assets/avatar1.png';
import avatar2 from './assets/avatar2.png';
import avatar3 from './assets/avatar3.png';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDayMode, setIsDayMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRaining, setIsRaining] = useState(true);
  const [isLightningEnabled, setIsLightningEnabled] = useState(true);
  const [crowDensity, setCrowDensity] = useState(5);
  const [isGrainEnabled, setIsGrainEnabled] = useState(false);
  const [isTrailEnabled, setIsTrailEnabled] = useState(false);
  const [isCustomCursorEnabled, setIsCustomCursorEnabled] = useState(false);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(() => {
    return parseInt(localStorage.getItem('cyber_avatar_index') || '0');
  });
  const [avatars, setAvatars] = useState([]);
  const [avatarObjects, setAvatarObjects] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const char = e.key.toUpperCase();
      const newSequence = (keySequence + char).slice(-4);
      setKeySequence(newSequence);

      if (newSequence === 'CANH') {
        setIsMatrixMode(prev => !prev);
        setKeySequence('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keySequence]);

  // Save selected index to localStorage
  useEffect(() => {
    localStorage.setItem('cyber_avatar_index', avatarIndex.toString());
  }, [avatarIndex]);

  // Fetch avatars from MySQL on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/avatars')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Map to just the image strings for compatibility with existing UI
          setAvatars(data.map(item => item.image_data));
          // We might also want to store IDs for deletion, so let's adjust the state
          setAvatarObjects(data);
        } else {
          // If DB is empty, use defaults
          setAvatars([avatar1, avatar2, avatar3]);
          setAvatarObjects([
            { id: 'd1', image_data: avatar1 },
            { id: 'd2', image_data: avatar2 },
            { id: 'd3', image_data: avatar3 }
          ]);
        }
      })
      .catch(err => {
        console.error("Server connection failed, using local defaults", err);
        setAvatars([avatar1, avatar2, avatar3]);
      });
  }, []);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;

        // POST to MySQL
        fetch('http://localhost:5000/api/avatars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_data: base64 })
        })
          .then(res => {
            if (!res.ok) throw new Error('Server error');
            return res.json();
          })
          .then(newAvatar => {
            setAvatars(prev => {
              const next = [...prev, newAvatar.image_data];
              setAvatarIndex(next.length - 1); // Set to the newly added avatar
              return next;
            });
            setAvatarObjects(prev => [...prev, newAvatar]);
            playKeySound();
          })
          .catch(err => {
            console.error("Upload to server failed:", err);
            alert("Lỗi: Không thể kết nối tới Server. Hãy đảm bảo bạn đã chạy 'node index.js' trong thư mục server.");
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteAvatar = (index) => {
    const target = avatarObjects[index];
    if (!target) return;
    if (avatars.length <= 1) return;

    // DELETE from MySQL if it's a real ID
    if (typeof target.id === 'number') {
      fetch(`http://localhost:5000/api/avatars/${target.id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert(data.message);
          }
          updateLocalAvatarState(index);
        })
        .catch(err => {
          console.error("Delete failed:", err);
          alert("Lỗi khi xóa ảnh khỏi database.");
        });
    } else {
      // Just local delete for defaults
      updateLocalAvatarState(index);
    }
  };

  const updateLocalAvatarState = (index) => {
    const newAvatars = avatars.filter((_, i) => i !== index);
    const newObjects = avatarObjects.filter((_, i) => i !== index);
    setAvatars(newAvatars);
    setAvatarObjects(newObjects);
    if (avatarIndex >= index && avatarIndex > 0) {
      setAvatarIndex(avatarIndex - 1);
    }
  };

  // Simulate AJAX loading
  const handleTabChange = (tab) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    if (!showIntro) {
      if (isRaining) {
        startRain();
      } else {
        stopRain();
      }
    }
  }, [isRaining, showIntro]);

  const getIcon = (tab) => {
    switch (tab) {
      case 'about': return <Ghost size={16} />;
      case 'skills': return <Cpu size={16} />;
      case 'projects': return <Code size={16} />;
      case 'contact': return <Mail size={16} />;
      default: return null;
    }
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className={`app-root ${isDayMode ? 'day-mode' : ''} ${!isCustomCursorEnabled ? 'system-cursor' : ''}`}>
      {isCustomCursorEnabled && <CustomCursor />}
      <AnimatePresence>
        {showIntro && (
          <LetterIntro onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {isMatrixMode ? (
        <MatrixBackground />
      ) : (
        <CyberpunkCity
          isDayMode={isDayMode}
          isRaining={isRaining}
          isLightningEnabled={isLightningEnabled}
        />
      )}

      {isMatrixMode && (
        <motion.div
          initial={{ opacity: 0, scale: 2 }}
          animate={{ opacity: 1, scale: 1 }}
          className="matrix-alert"
        >
          [ ACCESS_GRANTED: MATRIX_OVERRIDE ]
        </motion.div>
      )}

      {!showIntro && (
        <>
          {/* Settings Toggle */}
          <div
            className="settings-container"
            onMouseEnter={() => {
              setShowSettings(true);
              playKeySound();
            }}
            onMouseLeave={() => setShowSettings(false)}
          >
            <button
              className={`settings-btn ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  className="settings-menu"
                  initial={{ opacity: 0, scale: 0.2, x: 50, rotate: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.2, x: 50, rotate: -15 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    opacity: { duration: 0.2 }
                  }}
                >
                  <div className="settings-header">HỆ_THỐNG_TÙY_CHỈNH</div>
                  <button
                    className="pixel-button small"
                    onClick={() => {
                      setIsDayMode(!isDayMode);
                      playKeySound();
                    }}
                  >
                    {isDayMode ? <Moon size={14} /> : <Sun size={14} />}
                    {isDayMode ? ' CHẾ ĐỘ ĐÊM' : ' CHẾ ĐỘ NGÀY'}
                  </button>
                  <button
                    className="pixel-button small"
                    onClick={() => {
                      setIsRaining(!isRaining);
                      playKeySound();
                    }}
                  >
                    <Zap size={14} />
                    {isRaining ? ' TẮT MƯA' : ' BẬT MƯA'}
                  </button>
                  <button
                    className="pixel-button small"
                    onClick={() => {
                      setIsLightningEnabled(!isLightningEnabled);
                      playKeySound();
                    }}
                  >
                    <Cpu size={14} />
                    {isLightningEnabled ? ' TẮT SẤM SÉT' : ' BẬT SẤM SÉT'}
                  </button>

                  <div className="setting-item">
                    <div className="setting-label">
                      <span>MẬT ĐỘ QUẠ: {crowDensity}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={crowDensity}
                      onChange={(e) => setCrowDensity(parseInt(e.target.value))}
                      className="pixel-slider"
                    />
                  </div>

                  <button
                    className="pixel-button small"
                    onClick={() => {
                      setIsGrainEnabled(!isGrainEnabled);
                      playKeySound();
                    }}
                  >
                    <Ghost size={14} />
                    {isGrainEnabled ? ' TẮT NHIỄU HẠT' : ' BẬT NHIỄU HẠT'}
                  </button>

                  <button
                    className="pixel-button small"
                    onClick={() => {
                      setIsTrailEnabled(!isTrailEnabled);
                      playKeySound();
                    }}
                  >
                    <Zap size={14} />
                    {isTrailEnabled ? ' TẮT VỆT CHUỘT' : ' BẬT VỆT CHUỘT'}
                  </button>

                  <button
                    className="pixel-button small"
                    onClick={() => {
                      setIsCustomCursorEnabled(!isCustomCursorEnabled);
                      playKeySound();
                    }}
                  >
                    <Settings size={14} />
                    {isCustomCursorEnabled ? ' DÙNG CHUỘT GỐC' : ' DÙNG CHUỘT PIXEL'}
                  </button>

                  <div className="setting-item">
                    <div className="setting-label">QUẢN LÝ AVATAR:</div>
                    <div className="avatar-grid">
                      {avatars.map((img, i) => (
                        <div key={i} className={`avatar-item ${avatarIndex === i ? 'active' : ''}`}>
                          <img
                            src={img}
                            alt={`Avatar ${i}`}
                            onClick={() => setAvatarIndex(i)}
                          />
                          <button
                            className="delete-avatar-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAvatar(i);
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <label className="avatar-upload-label">
                        +
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <header className="main-header">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="header-content"
            >
              <h1>Dev_Canh.exe</h1>
              <p className="subtitle">Pháp Sư Fullstack Cấp 25</p>
            </motion.div>
          </header>

          <nav className="pixel-nav">
            {['about', 'skills', 'projects', 'contact'].map(tab => {
              const labels = {
                about: 'GIỚI THIỆU',
                skills: 'KỸ NĂNG',
                projects: 'DỰ ÁN',
                contact: 'LIÊN HỆ'
              };
              return (
                <button
                  key={tab}
                  className={`pixel-button ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  <span className="btn-icon">{getIcon(tab)}</span>
                  {labels[tab]}
                </button>
              );
            })}
          </nav>

          <main className="content-area">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  className="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  ĐANG_TẢI_DỮ_LIỆU...
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="tab-content"
                >
                  {activeTab === 'about' && (
                    <div className="about-section">
                      <PixelCard
                        title="HỆ_THỐNG_SINH_HỌC"
                        subtitle="Trạng thái: Đang hoạt động"
                        onClick={() => handleCardClick({
                          title: "CHI TIẾT TIỂU SỬ",
                          content: "Tôi bắt đầu hành trình của mình từ những dòng code C++ cơ bản. Sau 5 năm, tôi đã phát triển thành một Fullstack Developer với niềm đam mê mãnh liệt cho các giao diện mang phong cách Retro và Cyberpunk. Tôi tin rằng công nghệ không chỉ là những dòng code khô khan mà còn là nghệ thuật kể chuyện thông qua các điểm ảnh."
                        })}
                      >
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                          <CyberAvatar avatars={avatars} forcedIndex={avatarIndex} />
                          <div>
                            <p style={{ margin: 0 }}>Hệ thống: <strong>CANH.EXE</strong></p>
                            <p style={{ margin: 0 }}>Chức năng: Fullstack Developer</p>
                          </div>
                        </div>
                        <p>
                          <Typewriter
                            key={activeTab}
                            text="Tôi là một nhà phát triển thành thạo Javascript và mã nhị phân. Tôi tạo ra các trải nghiệm kỹ thuật số nằm giữa các điểm ảnh và bóng tối."
                            delay={800}
                          />
                        </p>
                        <p>
                          <Typewriter
                            key={`${activeTab}-motto`}
                            text='Châm ngôn: "Code chỉ là tạm thời, logic là vĩnh cửu."'
                            delay={5500}
                          />
                        </p>
                      </PixelCard>
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="grid-layout">
                      <PixelCard
                        title="FRONTEND"
                        subtitle="Thông Thạo: 90%"
                        onClick={() => handleCardClick({
                          title: "FRONTEND STACK",
                          content: "Kinh nghiệm chuyên sâu về React, Next.js và các thư viện quản lý state như Redux/Zustand. Khả năng thiết kế UI/UX theo phong cách pixel-perfect và đáp ứng đa thiết bị."
                        })}
                      >
                        <ul className="pixel-list">
                          <li><Zap size={14} /> <Typewriter key={`${activeTab}-f1`} text="React / Next.js" delay={300} /></li>
                          <li><Zap size={14} /> <Typewriter key={`${activeTab}-f2`} text="Tailwind / SCSS" delay={800} /></li>
                          <li><Zap size={14} /> <Typewriter key={`${activeTab}-f3`} text="Framer Motion" delay={1300} /></li>
                        </ul>
                      </PixelCard>
                      <PixelCard
                        title="BACKEND"
                        subtitle="Thông Thạo: 85%"
                        onClick={() => handleCardClick({
                          title: "BACKEND STACK",
                          content: "Xây dựng các hệ thống scalable sử dụng Node.js, thiết kế cơ sở dữ liệu tối ưu với PostgreSQL và tối ưu hiệu năng thông qua Redis. Thành thạo Docker và CI/CD."
                        })}
                      >
                        <ul className="pixel-list">
                          <li><Zap size={14} /> <Typewriter key={`${activeTab}-b1`} text="Node.js / Express" delay={500} /></li>
                          <li><Zap size={14} /> <Typewriter key={`${activeTab}-b2`} text="PostgreSQL / MongoDB" delay={1000} /></li>
                          <li><Zap size={14} /> <Typewriter key={`${activeTab}-b3`} text="Redis Caching" delay={1500} /></li>
                        </ul>
                      </PixelCard>
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <div className="grid-layout">
                      <PixelCard
                        title="DỰ ÁN: NEON_VOID"
                        subtitle="Phát triển: 2024"
                        onClick={() => handleCardClick({
                          title: "NEON_VOID DETAILS",
                          content: "Một ứng dụng trò chuyện mã hóa hoàn toàn được xây dựng trên nền tảng Web3. Sử dụng Socket.io cho giao tiếp thời gian thực và AES-256 cho bảo mật dữ liệu. Giao diện được thiết kế theo phong cách Cyberpunk neon."
                        })}
                      >
                        <p>
                          <Typewriter
                            key={activeTab}
                            text="Ứng dụng nhắn tin phi tập trung với mã hóa đầu cuối và giao diện pixel."
                            delay={500}
                          />
                        </p>
                        <button className="pixel-button"><Code size={14} /> XEM_NGUỒN</button>
                      </PixelCard>
                      <PixelCard
                        title="DỰ ÁN: TECHSTORE"
                        subtitle="Phát triển: 2025"
                        onClick={() => handleCardClick({
                          title: "TECHSTORE DETAILS",
                          content: "Hệ thống bán lẻ thiết bị công nghệ trực tuyến được xây dựng bằng ngôn ngữ PHP và hệ quản trị cơ sở dữ liệu MySQL. Dự án tích hợp đầy đủ các tính năng thương mại điện tử chuyên nghiệp: Quản lý giỏ hàng, tìm kiếm & bộ lọc sản phẩm, tin tức công nghệ (Blog), đăng ký/đăng nhập thành viên và trang quản trị (Admin) trực quan."
                        })}
                      >
                        <p>
                          <Typewriter
                            key={`${activeTab}-void`}
                            text="Nền tảng thương mại điện tử chuyên nghiệp cung cấp thiết bị công nghệ chính hãng hàng đầu."
                            delay={800}
                          />
                        </p>
                        <button
                          className="pixel-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open("https://doanmonhoc.id.vn/", "_blank", "noopener,noreferrer");
                          }}
                        >
                          <Zap size={14} /> KHỞI_CHẠY_APP
                        </button>
                      </PixelCard>
                    </div>
                  )}

                  {activeTab === 'contact' && (
                    <PixelCard
                      title="KÊNH_LIÊN_LẠC"
                      subtitle="Phản hồi trong: 24h"
                      onClick={() => handleCardClick({
                        title: "THÔNG TIN LIÊN HỆ",
                        content: "Bạn có thể liên hệ với tôi qua email: dev.canh@example.com hoặc tìm thấy tôi trên GitHub/LinkedIn. Tôi luôn sẵn sàng cho các cơ hội cộng tác mới và các dự án mã nguồn mở."
                      })}
                    >
                      <ul className="pixel-list">
                        <li><Mail size={16} /> dev.canh@example.com</li>
                        <li><Code size={16} /> github.com/dev_canh</li>
                        <li><ExternalLink size={16} /> linkedin.com/in/canh_dev</li>
                      </ul>
                      <div className="terminal-input">
                        <span>$</span>
                        <input type="text" className="pixel-input" placeholder="Gửi tin nhắn cho tôi..." />
                      </div>
                    </PixelCard>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="main-footer">
            <p>© 2024 DEV_CANH_SYSTEM // ALL RIGHTS RESERVED</p>
            <p>VERSION_2.0.4_BETA</p>
            <p className="easter-egg-hint">Gợi ý: Nhập "CANH" để kích hoạt hệ thống ẩn</p>
          </footer>

          <PixelModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            title={selectedItem?.title}
          >
            <p>{selectedItem?.content}</p>
          </PixelModal>

          <Crows density={crowDensity} />
          {isGrainEnabled && <div className="film-grain"></div>}
          {isTrailEnabled && <CursorTrail isDayMode={isDayMode} />}
        </>
      )}
    </div>
  );
}

export default App;
