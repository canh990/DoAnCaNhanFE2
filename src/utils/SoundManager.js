let sharedAudioCtx = null;
let lastSoundTime = 0;
const MIN_SOUND_GAP = 0.01;
let rainSource = null;

export const initAudio = () => {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

export const playKeySound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  if (now - lastSoundTime < MIN_SOUND_GAP) return;
  lastSoundTime = now;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(150 + Math.random() * 50, now);
  osc.frequency.exponentialRampToValueAtTime(10, now + 0.06);

  gain.gain.setValueAtTime(0.2, now); 
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(now + 0.06);
};

// Pronounced Paper/Envelope Opening Sound
export const playOpenSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // 1. Primary Paper Friction (Mid-high frequencies)
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(2500, now + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.6, now + 0.05); // Louder
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  noiseSource.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noiseSource.start(now);

  // 2. Low-end "Slide" (Subtle rumble of the envelope flap)
  const rumbleOsc = ctx.createOscillator();
  const rumbleGain = ctx.createGain();
  rumbleOsc.type = 'triangle';
  rumbleOsc.frequency.setValueAtTime(100, now);
  rumbleOsc.frequency.linearRampToValueAtTime(40, now + 0.3);
  rumbleGain.gain.setValueAtTime(0, now);
  rumbleGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  rumbleOsc.connect(rumbleGain);
  rumbleGain.connect(ctx.destination);
  rumbleOsc.start(now);
  rumbleOsc.stop(now + 0.3);

  // 3. Sharp Mechanical "Click" (Envelope seal release)
  const clickOsc = ctx.createOscillator();
  const clickGainNode = ctx.createGain();
  clickOsc.type = 'triangle';
  clickOsc.frequency.setValueAtTime(250, now);
  clickOsc.frequency.exponentialRampToValueAtTime(10, now + 0.08);
  clickGainNode.gain.setValueAtTime(0.3, now); // More distinct click
  clickGainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
  clickGainNode.connect(ctx.destination);
  clickOsc.connect(clickGainNode);
  clickOsc.start(now);
  clickOsc.stop(now + 0.08);
};

let rainGain = null;

export const startRain = () => {
  const ctx = initAudio();
  if (!ctx || rainSource) return;

  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;
    b6 = white * 0.115926;
  }

  rainSource = ctx.createBufferSource();
  rainSource.buffer = buffer;
  rainSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1200;

  rainGain = ctx.createGain();
  rainGain.gain.setValueAtTime(0, ctx.currentTime);
  rainGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2); // Fade in over 2s

  rainSource.connect(filter);
  filter.connect(rainGain);
  rainGain.connect(ctx.destination);
  rainSource.start();
};

export const stopRain = () => {
  if (rainSource && rainGain) {
    const ctx = sharedAudioCtx;
    const now = ctx.currentTime;
    rainGain.gain.cancelScheduledValues(now);
    rainGain.gain.setValueAtTime(rainGain.gain.value, now);
    rainGain.gain.linearRampToValueAtTime(0, now + 2); // Fade out over 2s
    
    const sourceToStop = rainSource;
    const gainToStop = rainGain;
    
    setTimeout(() => {
      try {
        sourceToStop.stop();
        sourceToStop.disconnect();
        gainToStop.disconnect();
      } catch (e) {
        console.warn("Rain source stop error:", e);
      }
    }, 2100);

    rainSource = null;
    rainGain = null;
  }
};

export const playThunderSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  const dist = Math.random();
  const volume = 1.0 - (dist * 0.6); 
  const delay = dist * 0.8; 
  const rumbleFreq = 500 - (dist * 300); 
  
  const panValue = Math.random() * 2 - 1;
  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(panValue, now + delay);
  panner.connect(ctx.destination);

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now + delay);
  masterGain.connect(panner);

  if (dist < 0.7) {
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(50, now + delay);
    subOsc.frequency.exponentialRampToValueAtTime(20, now + delay + 2);
    subGain.gain.setValueAtTime(0, now + delay);
    subGain.gain.linearRampToValueAtTime(0.7 * (1 - dist), now + delay + 0.05);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 2);
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(now + delay);
    subOsc.stop(now + delay + 2);
  }

  if (dist < 0.5) {
    const crackBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const crackData = crackBuffer.getChannelData(0);
    for (let i = 0; i < crackBuffer.length; i++) {
      const jitter = Math.random() > 0.8 ? 1.8 : 0.4;
      crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05)) * jitter;
    }
    const crackSource = ctx.createBufferSource();
    crackSource.buffer = crackBuffer;
    const crackFilter = ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 1200;
    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.8 * (1 - dist), now + delay);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);
    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(masterGain);
    crackSource.start(now + delay);
  }

  const createRumble = (offset, vol, duration, f) => {
    const rumbleBuffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const rumbleData = rumbleBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < rumbleBuffer.length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (0.02 * white)) / 1.02;
      const mod = 1 + Math.sin(i / 1500) * 0.3; 
      rumbleData[i] = lastOut * 7 * Math.exp(-i / (ctx.sampleRate * duration * 0.5)) * mod;
    }
    
    const rumbleSource = ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(f, now + delay + offset);
    filter.frequency.exponentialRampToValueAtTime(20, now + delay + offset + duration);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now + delay + offset);
    gain.gain.linearRampToValueAtTime(vol, now + delay + offset + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + delay + offset + duration);
    
    rumbleSource.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    rumbleSource.start(now + delay + offset);
  };

  createRumble(0.1, 0.9, 4, rumbleFreq); 
  createRumble(0.6, 0.4, 3, rumbleFreq * 0.7);
  createRumble(1.5, 0.3, 6, 80); 
};



export const playCrowSound = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Distant caw: higher pitch, distorted sine/square
  const createCaw = (offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400 + Math.random() * 100, now + offset);
    osc.frequency.exponentialRampToValueAtTime(300, now + offset + 0.3);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now + offset);
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.05, now + offset + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.4);
  };

  createCaw(0);
  if (Math.random() > 0.5) createCaw(0.2); // Double caw
};

export const playTechGlitch = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(10, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
  osc.frequency.setValueAtTime(50, now + 0.15);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.setValueAtTime(0, now + 0.05);
  gain.gain.setValueAtTime(0.05, now + 0.1);
  gain.gain.setValueAtTime(0, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(now + 0.2);
};

export const playDigitalOpen = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.8);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(5000, now + 0.8);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(now + 1);
};
