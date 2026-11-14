import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar } from 'antd';
import { LoaderCircle, Maximize2, Minimize2, Mic, MicOff, Phone, PhoneOff, Video, VideoOff, Volume2, X } from 'lucide-react';
import { apiFetchTongQuat } from '../../services/apiTongQuat';
import { getPublicUrl } from '../../utils/formatURL';
import { useSounds } from '../Sound/SoundContext';
import styles from './CallPanel.module.css';

const picture = person => <Avatar size={72} className={styles.avatar} src={person?.anh_dai_dien ? getPublicUrl(person.anh_dai_dien) : undefined}>{person?.ho_ten?.trim()?.charAt(0)?.toUpperCase() || '?'}</Avatar>;
function Media({ call, token, peer, setError }) {
  const local = useRef(null), remote = useRef(null), audio = useRef(null), roomRef = useRef(null);
  const [status, setStatus] = useState('Đang kết nối...');
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(call.mode === 'video');
  const [remoteVideo, setRemoteVideo] = useState(false);
  const [remotePresent, setRemotePresent] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false, room;
    const start = async () => {
      try {
        setStatus('Đang kết nối...'); setError('');
        const [{ Room, RoomEvent, Track }, credentials] = await Promise.all([
          import('livekit-client'),
          apiFetchTongQuat(`/api/calls/${call._id}/token`, { method: 'POST', body: {}, headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (cancelled) return;
        room = new Room({ adaptiveStream: true, dynacast: true }); roomRef.current = room;
        const videoState = () => {
          if (cancelled) return;
          const participant = [...room.remoteParticipants.values()][0];
          const publication = participant?.getTrackPublication(Track.Source.Camera);
          setRemotePresent(Boolean(participant)); setRemoteVideo(Boolean(publication?.track && !publication.isMuted));
        };
        room.on(RoomEvent.TrackSubscribed, track => {
          if (cancelled) return;
          if (track.kind === Track.Kind.Video && remote.current) track.attach(remote.current);
          if (track.kind === Track.Kind.Audio && audio.current) track.attach(audio.current);
          videoState();
        });
        room.on(RoomEvent.TrackUnsubscribed, track => { track.detach(); videoState(); });
        room.on(RoomEvent.TrackMuted, videoState); room.on(RoomEvent.TrackUnmuted, videoState);
        room.on(RoomEvent.ParticipantConnected, videoState); room.on(RoomEvent.ParticipantDisconnected, videoState);
        room.on(RoomEvent.Reconnecting, () => { if (!cancelled) setStatus('Đang kết nối lại...'); });
        room.on(RoomEvent.Reconnected, () => { if (!cancelled) setStatus('Đã kết nối'); });
        room.on(RoomEvent.Disconnected, () => { if (!cancelled) setStatus('Đã ngắt kết nối'); });
        room.on(RoomEvent.AudioPlaybackStatusChanged, () => { if (!cancelled) setAudioBlocked(!room.canPlaybackAudio); });
        await room.connect(credentials.url, credentials.token);
        if (cancelled) { await room.disconnect(); return; }
        setStatus('Đã kết nối'); videoState();
        try { await room.startAudio(); } catch { if (!cancelled) setAudioBlocked(true); }
        await room.localParticipant.setMicrophoneEnabled(true);
        if (cancelled) { await room.disconnect(); return; }
        setMic(true);
        if (call.mode === 'video') {
          const publication = await room.localParticipant.setCameraEnabled(true);
          if (cancelled) { await room.disconnect(); return; }
          if (publication?.track && local.current) publication.track.attach(local.current);
          setCamera(true);
        } else setCamera(false);
      } catch (err) {
        if (room) await room.disconnect().catch(() => {});
        if (!cancelled) {
          roomRef.current = null; setStatus('Không thể kết nối');
          setError(err?.name === 'NotAllowedError' ? 'Bạn chưa cho phép truy cập micro hoặc camera. Hãy kiểm tra quyền trình duyệt.' : err?.message || 'Không thể truy cập micro hoặc camera. Hãy kiểm tra quyền trình duyệt.');
        }
      }
    };
    start();
    return () => { cancelled = true; if (room) void room.disconnect().catch(() => {}); roomRef.current = null; };
  }, [call._id, call.mode, token, retry, setError]);
  const toggleMic = async () => { try { const next = !mic; await roomRef.current?.localParticipant.setMicrophoneEnabled(next); setMic(next); } catch { setError('Không thể thay đổi micro. Hãy kiểm tra quyền thiết bị.'); } };
  const toggleCamera = async () => { try { const next = !camera; const publication = await roomRef.current?.localParticipant.setCameraEnabled(next); if (next && publication?.track && local.current) publication.track.attach(local.current); if (!next && local.current) local.current.srcObject = null; setCamera(next); } catch { setError('Không thể bật camera. Hãy kiểm tra quyền thiết bị.'); } };
  return <>
    <div className={styles.stage}>
      <video className={`${styles.remoteVideo} ${remoteVideo ? styles.visible : ''}`} ref={remote} autoPlay playsInline />
      <audio ref={audio} autoPlay />
      {!remoteVideo && <div className={styles.stagePlaceholder}>{picture(peer)}<strong>{peer?.ho_ten || 'Người tham gia'}</strong><span>{remotePresent ? 'Camera đang tắt' : 'Đang chờ người kia tham gia...'}</span></div>}
      <div className={`${styles.selfPreview} ${camera ? '' : styles.selfOff}`}><video ref={local} autoPlay playsInline muted /><span>{camera ? 'Bạn' : <VideoOff size={18} />}</span></div>
      <span className={styles.connection}>{status}</span>
    </div>
    <div className={styles.controls}>
      <button type="button" className={`${styles.control} ${mic ? '' : styles.controlOff}`} onClick={toggleMic} disabled={!roomRef.current} aria-label={mic ? 'Tắt micro' : 'Bật micro'} title={mic ? 'Tắt micro' : 'Bật micro'}>{mic ? <Mic size={19} /> : <MicOff size={19} />}</button>
      <button type="button" className={`${styles.control} ${camera ? '' : styles.controlOff}`} onClick={toggleCamera} disabled={!roomRef.current} aria-label={camera ? 'Tắt camera' : 'Bật camera'} title={camera ? 'Tắt camera' : 'Bật camera'}>{camera ? <Video size={19} /> : <VideoOff size={19} />}</button>
      {(status === 'Không thể kết nối' || status === 'Đã ngắt kết nối') && <button type="button" className={styles.retry} onClick={() => setRetry(value => value + 1)}>Thử kết nối lại</button>}
      {audioBlocked && <button type="button" className={styles.retry} onClick={() => roomRef.current?.startAudio().then(() => setAudioBlocked(false)).catch(() => setError('Không thể phát âm thanh.'))}><Volume2 size={16} /> Bật âm thanh</button>}
    </div>
  </>;
}
export default function CallPanel({ call, userId, token, owner, busy, error, setError, accept, end, dismiss, claim }) {
  const { play, stop } = useSounds();
  const incoming = call.status === 'ringing' && String(call.calleeId) === userId;
  const isCaller = String(call.callerId) === userId;
  const peer = isCaller ? call.callee : call.caller;
  const isActive = call.status === 'ringing' || call.status === 'accepted';
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ringingCall = useRef(null);
  const soundedMissedCall = useRef(null);
  useEffect(() => { setMinimized(false); setExpanded(false); }, [call._id]);
  useEffect(() => {
    if (call.status !== 'accepted') { setExpanded(false); setMinimized(false); }
  }, [call.status]);
  useEffect(() => {
    if (!expanded) return;
    const handleKeyDown = event => { if (event.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);
  useEffect(() => {
    if (call.status !== 'ringing') return;
    const sound = incoming ? 'incoming' : 'waiting';
    play(sound, { loop: true });
    return () => stop(sound);
  }, [call._id, call.status, incoming, play, stop]);
  useEffect(() => {
    if (call.status === 'ringing') ringingCall.current = call._id;
    const missed = ((call.status === 'missed' && ringingCall.current === call._id) || (call.status === 'busy' && isCaller)) && soundedMissedCall.current !== call._id;
    if (missed) { soundedMissedCall.current = call._id; play('missed'); return () => stop('missed'); }
  }, [call._id, call.status, isCaller, play, stop]);
  useEffect(() => {
    if (call.status !== 'missed' || !isCaller) return;
    const timer = setTimeout(dismiss, 5000);
    return () => clearTimeout(timer);
  }, [call._id, call.status, isCaller, dismiss]);
  const setMediaError = useCallback(value => setError(value), [setError]);
  return <>
    {expanded && <div className={styles.backdrop} onClick={() => setExpanded(false)} aria-hidden="true" />}
    <section className={`${styles.panel} ${minimized ? styles.minimized : ''} ${expanded ? styles.expanded : ''}`} aria-label="Cuộc gọi" role="dialog" aria-modal="false">
    <header className={styles.header}><div><span>{call.mode === 'video' ? 'CUỘC GỌI VIDEO' : 'CUỘC GỌI THOẠI'}</span><strong>{peer?.ho_ten || 'Cuộc gọi'}</strong></div><div className={styles.headerActions}>
      {call.status === 'accepted' && call.mode === 'video' && <button type="button" className={styles.viewButton} aria-label={expanded ? 'Thu nhỏ video về góc màn hình' : 'Phóng to video giữa màn hình'} title={expanded ? 'Thu nhỏ video' : 'Phóng to video'} aria-pressed={expanded} onClick={() => { setMinimized(false); setExpanded(value => !value); }}>{expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>}
      {call.status === 'accepted' && <button type="button" className={styles.minimize} aria-label={minimized ? 'Mở lại cuộc gọi' : 'Thu gọn cuộc gọi'} onClick={() => { setExpanded(false); setMinimized(value => !value); }}>{minimized ? 'Mở lại' : 'Thu gọn'}</button>}
      {!isActive && <button type="button" className={styles.close} onClick={dismiss} aria-label="Đóng"><X size={18} /></button>}
    </div></header>
    <div className={styles.panelBody}>
      {call.status === 'ringing' ? <div className={styles.ringing}>{picture(peer)}<strong>{peer?.ho_ten || 'Học viên'}</strong><span>{incoming ? `Đang gọi ${call.mode === 'video' ? 'video' : 'thoại'} cho bạn` : 'Đang chờ người nhận trả lời...'}</span><div className={styles.ringControls}>{incoming && <button type="button" className={styles.accept} disabled={busy} onClick={accept} aria-label="Chấp nhận cuộc gọi"><Phone size={20} /></button>}<button type="button" className={styles.hangup} disabled={busy} onClick={end} aria-label={incoming ? 'Từ chối cuộc gọi' : 'Hủy cuộc gọi'}><PhoneOff size={20} /></button></div><small>{incoming ? 'Chấp nhận hoặc từ chối cuộc gọi' : 'Tự kết thúc nếu không trả lời sau 60 giây'}</small></div> : call.status === 'accepted' ? <>{owner ? <Media call={call} token={token} peer={peer} setError={setMediaError} /> : <div className={styles.ringing}>{picture(peer)}<strong>Cuộc gọi đang diễn ra</strong><span>Cuộc gọi có thể đang mở trên thiết bị khác.</span><button type="button" className={styles.join} onClick={claim}>Tham gia trên thiết bị này</button></div>}<div className={styles.endRow}><button type="button" className={styles.hangup} onClick={end} disabled={busy} aria-label="Kết thúc cuộc gọi"><PhoneOff size={20} /></button><span>Kết thúc</span></div></> : <div className={styles.ringing}>{picture(peer)}<strong>{call.status === 'busy' ? 'Người nhận đang bận' : call.status === 'declined' ? 'Cuộc gọi đã bị từ chối' : call.status === 'missed' ? (isCaller ? 'Người nhận không trả lời' : 'Cuộc gọi nhỡ') : 'Cuộc gọi đã kết thúc'}</strong><button type="button" className={styles.join} onClick={dismiss}>Đóng</button></div>}
      {error && <div className={styles.error} role="alert">{error}</div>}
    </div>
    {busy && <div className={styles.busy}><LoaderCircle size={18} /></div>}
  </section></>;
}
