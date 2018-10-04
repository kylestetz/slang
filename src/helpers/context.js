const WebkitAudio = 'webkitAudioContext';
const context = window[WebkitAudio] ? new window[WebkitAudio]() : new AudioContext();

export default context;
