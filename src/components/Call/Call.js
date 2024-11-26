import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMicrophone,
    faMicrophoneSlash,
    faPhone,
    faVideoCamera,
    faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import styles from './Call.module.scss';

const Call = ({ isCalling, endCall, isVideoCall, friendId }) => {
    const [peer, setPeer] = useState(null);
    const [call, setCall] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const [isDragging, setIsDragging] = useState(false);
    const [windowPos, setWindowPos] = useState({ top: 0, left: 0 });
    const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });
    const [isFullScreen, setIsFullScreen] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const newPeer = new Peer();
        setPeer(newPeer);

        newPeer.on('open', (id) => {
            console.log('Peer ID:', id);
        });

        newPeer.on('call', (incomingCall) => {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setCall(incomingCall);
                    localVideoRef.current.srcObject = stream;
                    incomingCall.answer(stream);
                    incomingCall.on('stream', (remoteStream) => {
                        remoteVideoRef.current.srcObject = remoteStream;
                    });
                })
                .catch((err) => console.error('Error accessing media devices', err));
        });
        return () => {
            newPeer.destroy();
        };
    }, []);

    const startCall = (friendId) => {
        const mediaConstraints = isVideoCall ? { video: true, audio: true } : { video: false, audio: true };
        navigator.mediaDevices

            .getUserMedia(mediaConstraints)
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                setIsCameraOn(isVideoCall);
                const newCall = peer.call(friendId, stream);
                setCall(newCall);
                newCall.on('stream', (remoteStream) => {
                    remoteVideoRef.current.srcObject = remoteStream;
                });
            })
            .catch((err) => console.error('Error accessing media devices', err));
    };

    const toggleMute = () => {
        setIsMuted((prev) => !prev);
        localVideoRef.current.srcObject.getAudioTracks().forEach((track) => {
            track.enabled = isMuted;
        });
    };

    const toggleCamera = () => {
        setIsCameraOn((prev) => {
            const newCameraState = !prev;
            console.log('after', newCameraState);
            localVideoRef.current.srcObject.getVideoTracks().forEach((track) => {
                track.enabled = newCameraState;
                if (!newCameraState) {
                    track.stop();
                }
            });

            console.log('before', newCameraState);

            return newCameraState;
        });
    };

    useEffect(() => {
        if (isCalling) {
            startCall(friendId);
        }
    }, [isCalling]);

    useEffect(() => {
        return () => {
            if (call) {
                call.close();
            }
        };
    }, [call]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                requestAnimationFrame(() => {
                    setWindowPos({
                        top: e.clientY - dragOffset.current.y,
                        left: e.clientX - dragOffset.current.x,
                    });
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragOffset.current = { x: e.clientX - windowPos.left, y: e.clientY - windowPos.top };
    };

    const toggleFullScreen = () => {
        if (isFullScreen) {
            setWindowSize({ width: 400, height: 300 });
            setWindowPos({ top: 100, left: 100 });
        } else {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            setWindowPos({ top: 0, left: 0 });
        }
        setIsFullScreen(!isFullScreen);
    };

    const endCurrentCall = () => {
        if (localVideoRef.current.srcObject) {
            const stream = localVideoRef.current.srcObject;
            stream.getVideoTracks().forEach((track) => track.stop());
            stream.getAudioTracks().forEach((track) => track.stop());
        }

        if (call) {
            call.close();
        }

        endCall();
    };

    console.log('isCamera', isCameraOn);
    return (
        <div>
            {isCalling && (
                <div
                    className={clsx(styles['video-call-window'], { [styles['full-screen']]: isFullScreen })}
                    style={{
                        top: windowPos.top,
                        left: windowPos.left,
                        width: windowSize.width,
                        height: windowSize.height,
                        position: 'absolute',
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <div className={styles['video-call-header']} onMouseDown={handleMouseDown}>
                        <button onClick={toggleFullScreen}>{isFullScreen ? 'Thu nhỏ' : 'Phóng to'}</button>
                        <button onClick={endCall}>Đóng</button>
                    </div>
                    <div className={styles['display-call-video']}>
                        <video className={styles['local-call-video']} ref={localVideoRef} autoPlay muted />
                        <video className={styles['remote-call-video']} ref={remoteVideoRef} autoPlay />
                    </div>
                    <div className={clsx(styles['controls'])}>
                        <button onClick={toggleMute}>
                            <FontAwesomeIcon
                                icon={isMuted ? faMicrophoneSlash : faMicrophone}
                                className={clsx(styles['btn-mute'])}
                            />
                        </button>
                        <button onClick={toggleCamera}>
                            <FontAwesomeIcon
                                className={clsx(styles['btn-camera'])}
                                icon={isCameraOn ? faVideoCamera : faVideoSlash}
                            />
                        </button>
                        <button onClick={endCurrentCall}>
                            <FontAwesomeIcon icon={faPhone} className={clsx(styles['btn-end-call'])} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Call;
