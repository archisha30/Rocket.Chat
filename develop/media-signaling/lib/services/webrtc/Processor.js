var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Emitter } from '@rocket.chat/emitter';
import { LocalStream } from './LocalStream';
import { RemoteStream } from './RemoteStream';
import { getExternalWaiter } from '../../utils/getExternalWaiter';
const DATA_CHANNEL_LABEL = 'rocket.chat';
export class MediaCallWebRTCProcessor {
    get muted() {
        return this._muted;
    }
    get held() {
        return this._held;
    }
    get audioLevel() {
        return this._audioLevel;
    }
    get localAudioLevel() {
        return this._localAudioLevel;
    }
    constructor(config) {
        this.config = config;
        this.iceGatheringTimedOut = false;
        this._muted = false;
        this._held = false;
        this.stopped = false;
        this.iceCandidateCount = 0;
        this.addedEmptyTransceiver = false;
        this._remoteMute = false;
        this._dataChannelEnded = false;
        this.localMediaStream = new MediaStream();
        this.remoteMediaStream = new MediaStream();
        this.iceGatheringWaiters = new Set();
        this.inputTrack = config.inputTrack;
        this._audioLevel = 0;
        this._localAudioLevel = 0;
        this._audioLevelTracker = null;
        this._dataChannel = null;
        this.peer = new RTCPeerConnection(config.rtc);
        this.localStream = new LocalStream(this.localMediaStream, this.peer, this.config.logger);
        this.remoteStream = new RemoteStream(this.remoteMediaStream, this.peer, this.config.logger);
        this.emitter = new Emitter();
        this.registerPeerEvents();
        this.registerAudioLevelTracker();
        this.initialization = this.initialize().catch((e) => {
            var _a;
            (_a = config.logger) === null || _a === void 0 ? void 0 : _a.error('MediaCallWebRTCProcessor.initialization error', e);
            this.stop();
        });
    }
    getRemoteMediaStream() {
        return this.remoteMediaStream;
    }
    setInputTrack(newInputTrack) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.setInputTrack');
            if (newInputTrack && newInputTrack.kind !== 'audio') {
                throw new Error('Unsupported track kind');
            }
            yield this.initialization;
            this.inputTrack = newInputTrack;
            yield this.loadInputTrack();
        });
    }
    createOffer(_a) {
        return __awaiter(this, arguments, void 0, function* ({ iceRestart }) {
            var _b, _c;
            (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.debug('MediaCallWebRTCProcessor.createOffer');
            if (this.stopped) {
                throw new Error('WebRTC Processor has already been stopped.');
            }
            yield this.initialization;
            if (!this.addedEmptyTransceiver) {
                (_c = this.config.logger) === null || _c === void 0 ? void 0 : _c.debug('MediaCallWebRTCProcessor.createOffer.addEmptyTransceiver');
                // If there's no audio transceivers yet, add a new one; since it's an offer, the track can be set later
                const transceivers = this.getAudioTransceivers();
                if (!transceivers.length) {
                    this.peer.addTransceiver('audio', { direction: 'sendrecv' });
                    this.addedEmptyTransceiver = true;
                }
            }
            this.createDataChannel();
            this.updateAudioDirectionBeforeNegotiation();
            if (iceRestart) {
                this.restartIce();
            }
            return this.peer.createOffer({});
        });
    }
    setMuted(muted) {
        if (this.stopped) {
            return;
        }
        this._muted = muted;
        this.localStream.setEnabled(!muted && !this._held);
        this.updateMuteForRemote();
    }
    setHeld(held) {
        if (this.stopped) {
            return;
        }
        this._held = held;
        this.localStream.setEnabled(!held && !this._muted);
        this.remoteStream.setEnabled(!held);
        this.updateAudioDirectionWithoutNegotiation();
    }
    stop() {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.stop');
        this.endDataChannel();
        this.stopped = true;
        // Stop only the remote stream; the track of the local stream may still be in use by another call so it's up to the session to stop it.
        this.remoteStream.stopAudio();
        this.unregisterPeerEvents();
        this.unregisterAudioLevelTracker();
        this.peer.close();
    }
    createAnswer() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.createAnswer');
            if (this.stopped) {
                throw new Error('WebRTC Processor has already been stopped.');
            }
            if (!this.inputTrack) {
                throw new Error('no-input-track');
            }
            yield this.initialization;
            const transceivers = this.getAudioTransceivers();
            if (!transceivers.length) {
                throw new Error('no-audio-transceiver');
            }
            return this.peer.createAnswer();
        });
    }
    setLocalDescription(sdp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.setLocalDescription');
            if (this.stopped) {
                return;
            }
            yield this.initialization;
            if (!['offer', 'answer'].includes(sdp.type)) {
                throw new Error('unsupported-description-type');
            }
            yield this.peer.setLocalDescription(sdp);
            if (sdp.type === 'answer') {
                this.updateAudioDirectionAfterNegotiation();
            }
        });
    }
    setRemoteDescription(sdp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.setRemoteDescription');
            if (this.stopped) {
                return;
            }
            yield this.initialization;
            if (!['offer', 'answer'].includes(sdp.type)) {
                throw new Error('unsupported-description-type');
            }
            if (sdp.type === 'offer') {
                this.updateAudioDirectionBeforeNegotiation();
            }
            yield this.peer.setRemoteDescription(sdp);
            if (sdp.type === 'answer') {
                this.updateAudioDirectionAfterNegotiation();
            }
        });
    }
    getInternalState(stateName) {
        switch (stateName) {
            case 'signaling':
                return this.peer.signalingState;
            case 'connection':
                return this.peer.connectionState;
            case 'iceConnection':
                return this.peer.iceConnectionState;
            case 'iceGathering':
                return this.peer.iceGatheringState;
            case 'iceUntrickler':
                if (this.iceGatheringTimedOut) {
                    return 'timeout';
                }
                return this.iceGatheringWaiters.size > 0 ? 'waiting' : 'not-waiting';
            case 'remoteMute':
                return this._remoteMute;
        }
    }
    getStats(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stopped) {
                return null;
            }
            yield this.initialization;
            return this.peer.getStats(selector);
        });
    }
    isRemoteHeld() {
        if (this.stopped) {
            return false;
        }
        if (['closed', 'failed', 'new'].includes(this.peer.connectionState)) {
            return false;
        }
        let anyTransceiverNotSending = false;
        const transceivers = this.getAudioTransceivers();
        for (const transceiver of transceivers) {
            if (!transceiver.currentDirection || transceiver.currentDirection === 'stopped') {
                continue;
            }
            if (transceiver.currentDirection.includes('send')) {
                return false;
            }
            anyTransceiverNotSending = true;
        }
        return anyTransceiverNotSending;
    }
    isRemoteMute() {
        return this._remoteMute;
    }
    isStable() {
        if (this.stopped) {
            return false;
        }
        return this.peer.signalingState === 'stable';
    }
    getLocalDescription() {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.getLocalDescription');
        if (this.stopped) {
            throw new Error('WebRTC Processor has already been stopped.');
        }
        return this.peer.localDescription;
    }
    waitForIceGathering() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.stopped || this.peer.iceGatheringState === 'complete') {
                return;
            }
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.waitForIceGathering');
            yield this.initialization;
            this.iceGatheringTimedOut = false;
            const iceGatheringData = getExternalWaiter({
                timeout: this.config.iceGatheringTimeout,
                timeoutFn: () => {
                    var _a;
                    if (!this.iceGatheringWaiters.has(iceGatheringData)) {
                        return;
                    }
                    (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.waitForIceGathering.timeout', this.iceCandidateCount);
                    this.clearIceGatheringData(iceGatheringData);
                    this.iceGatheringTimedOut = true;
                    this.changeInternalState('iceUntrickler');
                },
            });
            this.iceGatheringWaiters.add(iceGatheringData);
            this.changeInternalState('iceUntrickler');
            yield iceGatheringData.promise;
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.inputTrack) {
                yield this.loadInputTrack();
            }
        });
    }
    startNewGathering() {
        this.clearIceGatheringWaiters(new Error('gathering-restarted'));
        this.iceCandidateCount = 0;
    }
    changeInternalState(stateName) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.changeInternalState', stateName);
        this.emitter.emit('internalStateChange', stateName);
    }
    updateAudioDirectionBeforeNegotiation() {
        var _a;
        // Before the negotiation, we set the direction based on our own state only
        // We'll tell the SDK that we want to send audio and, depending on the "on hold" state, also receive it
        const desiredDirection = this.held ? 'sendonly' : 'sendrecv';
        const transceivers = this.getAudioTransceivers();
        for (const transceiver of transceivers) {
            if (transceiver.direction === 'stopped') {
                continue;
            }
            if (transceiver.direction !== desiredDirection) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug(`Changing audio direction from ${transceiver.direction} to ${desiredDirection}`);
            }
            transceiver.direction = desiredDirection;
        }
    }
    updateAudioDirectionAfterNegotiation() {
        // Before the negotiation started, we told the browser we wanted to send audio - but we don't care if actually send or not, it's up to the other side to determine if they want to receive.
        // If the other side doesn't want to receive audio, the negotiation will result in a state where "direction" and "currentDirection" don't match
        // But if the only difference is that we said we want to send audio and are not sending it, then we can change what we say we want to reflect the current state
        var _a;
        // If we didn't do this, everything would still work, but the browser would trigger redundant renegotiations whenever the directions mismatch
        const desiredDirection = this.held ? 'sendonly' : 'sendrecv';
        const acceptableDirection = this.held ? 'inactive' : 'recvonly';
        const transceivers = this.getAudioTransceivers();
        for (const transceiver of transceivers) {
            if (transceiver.direction !== desiredDirection) {
                continue;
            }
            if (!transceiver.currentDirection || ['stopped', desiredDirection].includes(transceiver.currentDirection)) {
                continue;
            }
            if (transceiver.currentDirection === acceptableDirection) {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug(`Changing audio direction from ${transceiver.direction} to match ${transceiver.currentDirection}.`);
                transceiver.direction = transceiver.currentDirection;
            }
        }
    }
    getAudioTransceivers() {
        return this.peer
            .getTransceivers()
            .filter((transceiver) => { var _a, _b; return ((_a = transceiver.sender.track) === null || _a === void 0 ? void 0 : _a.kind) === 'audio' || ((_b = transceiver.receiver.track) === null || _b === void 0 ? void 0 : _b.kind) === 'audio'; });
    }
    updateAudioDirectionWithoutNegotiation() {
        var _a;
        // If the signaling state is not stable, then a negotiation is already happening and the audio direction will be updated by them
        if (this.peer.signalingState !== 'stable') {
            return;
        }
        const desiredDirection = this.held ? 'sendonly' : 'sendrecv';
        const acceptableDirection = this.held ? 'inactive' : 'recvonly';
        const transceivers = this.getAudioTransceivers();
        for (const transceiver of transceivers) {
            // If the last direction we requested still matches our current requirements, then we don't need to change our request
            if ([desiredDirection, acceptableDirection, 'stopped'].includes(transceiver.direction)) {
                continue;
            }
            // If the current state of the call doesn't match what we are requesting here, the browser will trigger the negotiation-needed event for us
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug(`Changing desired audio direction from ${transceiver.direction} to ${desiredDirection}.`);
            transceiver.direction = desiredDirection;
        }
    }
    createDataChannel() {
        var _a;
        if (this._dataChannel || this._dataChannelEnded || !this.config.call.flags.includes('create-data-channel')) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.createDataChannel');
        const channel = this.peer.createDataChannel(DATA_CHANNEL_LABEL);
        this.initializeDataChannel(channel);
    }
    endDataChannel() {
        this._dataChannelEnded = true;
        this.sendP2PCommand('end');
    }
    initializeDataChannel(channel) {
        var _a;
        if (channel.label !== DATA_CHANNEL_LABEL) {
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.warn('Unexpected Data Channel', channel.label);
            return;
        }
        channel.onopen = (_event) => {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('Data Channel Open', channel.label);
            if (!this._dataChannel || this._dataChannel.readyState !== 'open') {
                this._dataChannel = channel;
            }
            this.updateMuteForRemote();
        };
        channel.onclose = (_event) => {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('Data Channel Closed', channel.label);
            if (this._dataChannel === channel) {
                this._dataChannel = null;
                if (this.config.call.state !== 'hangup') {
                    this.createDataChannel();
                }
            }
        };
        channel.onmessage = (event) => {
            var _a, _b;
            if (typeof event.data !== 'string') {
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('Invalid Data Channel Message');
                return;
            }
            (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.debug('Data Channel Message', event.data);
            const command = this.getCommandFromDataChannelMessage(event.data);
            if (command) {
                this.onP2PCommand(command);
            }
        };
        if (!this._dataChannel) {
            this._dataChannel = channel;
        }
    }
    sendP2PCommand(command) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.sendP2PCommand', command);
        if (!this._dataChannel) {
            return false;
        }
        if (this._dataChannel.readyState !== 'open') {
            return false;
        }
        const jsonCommand = JSON.stringify({ command });
        this._dataChannel.send(jsonCommand);
        return true;
    }
    isValidCommand(command) {
        return ['mute', 'unmute', 'end'].includes(command);
    }
    getCommandFromDataChannelMessage(message) {
        var _a;
        try {
            const obj = JSON.parse(message);
            if (obj.command && this.isValidCommand(obj.command)) {
                return obj.command;
            }
        }
        catch (_b) {
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('Failed to parse Data Channel Command');
        }
        return null;
    }
    onP2PCommand(command) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onP2PCommand', command);
        switch (command) {
            case 'mute':
                this.setRemoteMute(true);
                break;
            case 'unmute':
                this.setRemoteMute(false);
                break;
            case 'end':
                this._dataChannelEnded = true;
                break;
        }
    }
    setRemoteMute(muted) {
        if (muted === this._remoteMute) {
            return;
        }
        this._remoteMute = muted;
        this.emitter.emit('internalStateChange', 'remoteMute');
    }
    updateMuteForRemote() {
        const command = this._muted ? 'mute' : 'unmute';
        this.sendP2PCommand(command);
    }
    registerPeerEvents() {
        const { peer } = this;
        peer.ontrack = (event) => this.onTrack(event);
        peer.onicecandidate = (event) => this.onIceCandidate(event);
        peer.onicecandidateerror = (event) => this.onIceCandidateError(event);
        peer.onconnectionstatechange = () => this.onConnectionStateChange();
        peer.oniceconnectionstatechange = () => this.onIceConnectionStateChange();
        peer.onnegotiationneeded = () => this.onNegotiationNeeded();
        peer.onicegatheringstatechange = () => this.onIceGatheringStateChange();
        peer.onsignalingstatechange = () => this.onSignalingStateChange();
        peer.ondatachannel = (event) => this.onDataChannel(event);
    }
    unregisterPeerEvents() {
        try {
            const { peer } = this;
            peer.ontrack = null;
            peer.onicecandidate = null;
            peer.onicecandidateerror = null;
            peer.onconnectionstatechange = null;
            peer.oniceconnectionstatechange = null;
            peer.onnegotiationneeded = null;
            peer.onicegatheringstatechange = null;
            peer.onsignalingstatechange = null;
            peer.ondatachannel = null;
        }
        catch (_a) {
            // suppress exceptions here
        }
    }
    registerAudioLevelTracker() {
        if (this._audioLevelTracker) {
            this.unregisterAudioLevelTracker();
        }
        this._audioLevelTracker = setInterval(() => {
            this.getStats()
                .then((stats) => {
                if (!stats) {
                    return;
                }
                stats.forEach((report) => {
                    var _a, _b;
                    if (report.kind !== 'audio') {
                        return;
                    }
                    switch (report.type) {
                        case 'inbound-rtp':
                            this._audioLevel = (_a = report.audioLevel) !== null && _a !== void 0 ? _a : 0;
                            break;
                        case 'media-source':
                            this._localAudioLevel = (_b = report.audioLevel) !== null && _b !== void 0 ? _b : 0;
                            break;
                    }
                });
            })
                .catch(() => {
                this._audioLevel = 0;
                this._localAudioLevel = 0;
            });
        }, 50);
    }
    unregisterAudioLevelTracker() {
        if (!this._audioLevelTracker) {
            return;
        }
        clearInterval(this._audioLevelTracker);
        this._audioLevelTracker = null;
        this._audioLevel = 0;
        this._localAudioLevel = 0;
    }
    restartIce() {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.restartIce');
        this.startNewGathering();
        this.peer.restartIce();
    }
    onIceCandidate(event) {
        var _a;
        if (this.stopped) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onIceCandidate', event.candidate);
        this.iceCandidateCount++;
    }
    onIceCandidateError(event) {
        var _a, _b;
        if (this.stopped) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onIceCandidateError');
        (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.error(event);
        this.emitter.emit('internalError', { critical: false, error: 'ice-candidate-error', errorDetails: JSON.stringify(event) });
    }
    onNegotiationNeeded() {
        var _a;
        if (this.stopped || this.peer.signalingState !== 'stable') {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onNegotiationNeeded');
        this.emitter.emit('negotiationNeeded');
    }
    onTrack(event) {
        var _a;
        if (this.stopped) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onTrack', event.track.kind);
        // Received a remote stream
        this.remoteStream.setTrack(event.track);
    }
    onConnectionStateChange() {
        var _a;
        if (this.stopped) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onConnectionStateChange');
        this.changeInternalState('connection');
    }
    onIceConnectionStateChange() {
        var _a;
        if (this.stopped) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onIceConnectionStateChange');
        this.changeInternalState('iceConnection');
    }
    onSignalingStateChange() {
        var _a;
        if (this.stopped) {
            return;
        }
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onSignalingStateChange');
        this.changeInternalState('signaling');
    }
    onIceGatheringStateChange() {
        var _a;
        if (this.stopped) {
            return;
        }
        const state = this.peer.iceGatheringState;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onIceGatheringStateChange', state);
        if (state === 'gathering') {
            this.iceCandidateCount = 0;
        }
        if (state === 'complete') {
            this.onIceGatheringComplete();
        }
        this.changeInternalState('iceGathering');
    }
    loadInputTrack() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.loadInputTrack');
            yield this.localStream.setTrack(this.inputTrack);
        });
    }
    onIceGatheringComplete() {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onIceGatheringComplete');
        this.clearIceGatheringWaiters();
    }
    onDataChannel(event) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.onDataChannel');
        this.initializeDataChannel(event.channel);
    }
    clearIceGatheringData(iceGatheringData, error) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.clearIceGatheringData');
        if (this.iceGatheringWaiters.has(iceGatheringData)) {
            this.iceGatheringWaiters.delete(iceGatheringData);
        }
        if (iceGatheringData.timeout) {
            clearTimeout(iceGatheringData.timeout);
        }
        if (error) {
            if (iceGatheringData.promiseReject) {
                iceGatheringData.promiseReject(error);
            }
            return;
        }
        if (iceGatheringData.promiseResolve) {
            iceGatheringData.promiseResolve();
        }
    }
    clearIceGatheringWaiters(error) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('MediaCallWebRTCProcessor.clearIceGatheringWaiters');
        this.iceGatheringTimedOut = false;
        if (!this.iceGatheringWaiters.size) {
            return;
        }
        const waiters = Array.from(this.iceGatheringWaiters.values());
        this.iceGatheringWaiters.clear();
        for (const iceGatheringData of waiters) {
            this.clearIceGatheringData(iceGatheringData, error);
        }
        this.changeInternalState('iceUntrickler');
    }
}
//# sourceMappingURL=Processor.js.map