import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import messageSound from '../../assets/amthanhtinnhan.mp3';
import incomingSound from '../../assets/nguoigoitoi.mp3';
import waitingSound from '../../assets/nhaccho.mp3';
import missedSound from '../../assets/nhacgoinho.mp3';

const SoundContext = createContext(null);
export const useSounds = () => useContext(SoundContext);
const sources = { message: messageSound, incoming: incomingSound, waiting: waitingSound, missed: missedSound };
const volumes = { message: 0.55, incoming: 0.7, waiting: 0.55, missed: 0.6 };

export function SoundProvider({ children }) {
  const players = useRef({});
  const generations = useRef({});
  const desiredLoops = useRef({});
  const getPlayer = useCallback(name => {
    if (!sources[name]) return null;
    if (!players.current[name]) {
      const audio = new Audio(sources[name]);
      audio.preload = 'auto';
      audio.volume = volumes[name];
      players.current[name] = audio;
    }
    return players.current[name];
  }, []);
  const stop = useCallback(name => {
    generations.current[name] = (generations.current[name] || 0) + 1;
    desiredLoops.current[name] = false;
    const audio = players.current[name];
    if (!audio) return;
    audio.pause();
    try { audio.currentTime = 0; } catch { /* Media may not have loaded yet. */ }
  }, []);
  const play = useCallback((name, { loop = false } = {}) => {
    const audio = getPlayer(name);
    if (!audio) return;
    generations.current[name] = (generations.current[name] || 0) + 1;
    desiredLoops.current[name] = loop;
    audio.loop = loop;
    audio.muted = false;
    try { audio.currentTime = 0; } catch { /* Media may not have loaded yet. */ }
    audio.play().catch(() => { /* Browsers may require interaction before playing audio. */ });
  }, [getPlayer]);
  useEffect(() => {
    // Prime each media element after a genuine user gesture for autoplay-limited browsers.
    const unlock = () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      for (const name of Object.keys(sources)) {
        const audio = getPlayer(name);
        if (desiredLoops.current[name]) {
          audio.muted = false;
          audio.play().catch(() => {});
          continue;
        }
        if (!audio.paused) continue;
        const generation = generations.current[name] || 0;
        audio.muted = true;
        audio.play().then(() => {
          if ((generations.current[name] || 0) === generation) {
            audio.pause();
            try { audio.currentTime = 0; } catch { /* Media may not have loaded yet. */ }
          }
          audio.muted = false;
        }).catch(() => { audio.muted = false; });
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      Object.values(players.current).forEach(audio => { audio.pause(); audio.removeAttribute('src'); audio.load(); });
      players.current = {};
    };
  }, [getPlayer]);
  const value = useMemo(() => ({ play, stop }), [play, stop]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
