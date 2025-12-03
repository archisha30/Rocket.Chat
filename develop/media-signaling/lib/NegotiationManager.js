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
import { Negotiation } from './services/webrtc/Negotiation';
export class NegotiationManager {
    get currentNegotiationId() {
        var _a;
        return ((_a = this.currentNegotiation) === null || _a === void 0 ? void 0 : _a.negotiationId) || this.highestNegotiationId;
    }
    constructor(call, config) {
        this.call = call;
        this.config = config;
        this.negotiations = new Map();
        this.currentNegotiation = null;
        this.highestProcessedSequence = 0;
        this.highestImpoliteSequence = 0;
        this.highestSequence = 0;
        this.webrtcProcessor = null;
        this.highestNegotiationId = null;
        this.highestKnownNegotiationId = null;
        this.emitter = new Emitter();
    }
    addNegotiation(negotiationId_1) {
        return __awaiter(this, arguments, void 0, function* (negotiationId, remoteOffer = null, negotiationSequence = null) {
            var _a;
            if (this.negotiations.has(negotiationId)) {
                return;
            }
            if (remoteOffer && remoteOffer.type !== 'offer') {
                return;
            }
            // If we are not receiving the negotiation sequence, trust that they are arriving in order.
            const sequence = negotiationSequence || this.highestSequence + 1;
            const isRemoteOffer = Boolean(remoteOffer);
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.addNegotiation', negotiationId, sequence, isRemoteOffer);
            const isPoliteNegotiation = isRemoteOffer !== this.isPoliteClient();
            const maxSkipSequence = isPoliteNegotiation ? this.highestSequence : this.highestImpoliteSequence;
            const negotiation = new Negotiation({
                negotiationId,
                sequence,
                isPolite: isPoliteNegotiation,
                remoteOffer,
            }, this.config.logger);
            if (sequence <= maxSkipSequence) {
                negotiation.end();
            }
            this.addToQueue(negotiation);
            return this.processNegotiations();
        });
    }
    setRemoteDescription(negotiationId_1, remoteDescription_1) {
        return __awaiter(this, arguments, void 0, function* (negotiationId, remoteDescription, negotiationSequence = null) {
            var _a, _b, _c, _d;
            if (remoteDescription.type === 'offer') {
                return this.addNegotiation(negotiationId, remoteDescription, negotiationSequence);
            }
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.setRemoteDescription', negotiationId);
            if (((_b = this.currentNegotiation) === null || _b === void 0 ? void 0 : _b.negotiationId) !== negotiationId) {
                (_c = this.config.logger) === null || _c === void 0 ? void 0 : _c.warn('Received remote description for an unexpected negotiation');
                this.emitter.emit('error', { errorCode: 'not-current-negotiation', negotiationId });
                return;
            }
            try {
                return this.currentNegotiation.setRemoteAnswer(remoteDescription);
            }
            catch (e) {
                (_d = this.config.logger) === null || _d === void 0 ? void 0 : _d.error(e);
                this.currentNegotiation = null;
                this.emitter.emit('error', { errorCode: 'failed-to-set-remote-answer', negotiationId });
            }
        });
    }
    setWebRTCProcessor(webrtcProcessor) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.setWebRTCProcessor');
        this.webrtcProcessor = webrtcProcessor;
        this.webrtcProcessor.emitter.on('internalError', (event) => this.onWebRTCInternalError(event));
        this.webrtcProcessor.emitter.on('negotiationNeeded', () => this.onWebRTCNegotiationNeeded());
    }
    processNegotiations() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.processNegotiations');
            if (!this.isConfigured()) {
                return;
            }
            if (this.currentNegotiation) {
                return;
            }
            const nextNegotiation = this.getNextInQueue();
            if (!nextNegotiation) {
                return;
            }
            yield this.processNegotiation(nextNegotiation);
        });
    }
    isPoliteClient() {
        return this.call.role === 'callee';
    }
    addToQueue(negotiation) {
        var _a, _b;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.addToQueue', negotiation.negotiationId);
        if (negotiation.sequence > this.highestSequence) {
            this.highestSequence = negotiation.sequence;
            this.highestKnownNegotiationId = negotiation.negotiationId;
        }
        this.negotiations.set(negotiation.negotiationId, negotiation);
        if (!negotiation.ended) {
            if (!negotiation.isPolite) {
                if (negotiation.sequence > this.highestImpoliteSequence) {
                    this.highestImpoliteSequence = negotiation.sequence;
                }
                if ((_b = this.currentNegotiation) === null || _b === void 0 ? void 0 : _b.isPolite) {
                    this.currentNegotiation.end();
                    this.currentNegotiation = null;
                }
            }
        }
    }
    getNextInQueue() {
        for (const negotiation of this.negotiations.values()) {
            // Skip negotiations that have already started processing or been skipped
            if (negotiation.ended || negotiation.started || negotiation.sequence <= this.highestProcessedSequence) {
                continue;
            }
            // Skip negotiations that can be fulfilled by some newer negotiation
            if (negotiation.sequence < this.highestImpoliteSequence) {
                negotiation.end();
                continue;
            }
            // Polite negotiations are only processed if there's nothing else queued
            if (negotiation.isPolite && negotiation.sequence < this.highestSequence) {
                negotiation.end();
                continue;
            }
            return negotiation;
        }
        return null;
    }
    processNegotiation(negotiation) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.processNegotiation', negotiation.negotiationId);
            this.currentNegotiation = negotiation;
            this.highestProcessedSequence = negotiation.sequence;
            this.highestNegotiationId = negotiation.negotiationId;
            negotiation.emitter.on('ended', () => {
                var _a;
                if (this.currentNegotiation !== negotiation) {
                    return;
                }
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.processNegotiation.ended');
                this.currentNegotiation = null;
                void this.processNegotiations();
            });
            negotiation.emitter.on('error', ({ errorCode }) => {
                var _a;
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.error('Negotiation error', errorCode);
                this.emitter.emit('error', { errorCode, negotiationId: negotiation.negotiationId });
            });
            negotiation.emitter.on('local-sdp', ({ sdp }) => {
                var _a;
                (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.processNegotiation.local-sdp');
                this.emitter.emit('local-sdp', { sdp, negotiationId: negotiation.negotiationId });
            });
            try {
                return negotiation.process(this.webrtcProcessor);
            }
            catch (e) {
                (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.error(e);
                this.currentNegotiation = null;
                this.emitter.emit('error', { errorCode: 'failed-to-process-negotiation', negotiationId: negotiation.negotiationId });
            }
        });
    }
    isConfigured() {
        var _a, _b, _c;
        if (this.call.state === 'hangup' || this.call.hidden) {
            (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('Ignoring WebRTC negotiations due to call state.');
            return false;
        }
        if (!this.webrtcProcessor) {
            (_b = this.config.logger) === null || _b === void 0 ? void 0 : _b.debug('Delaying WebRTC negotiations due to missing processor.');
            return false;
        }
        // Wait for the input track before negotiating, to avoid potentially having to renegotiate immediately
        if (!this.call.hasInputTrack()) {
            (_c = this.config.logger) === null || _c === void 0 ? void 0 : _c.debug('Delaying WebRTC negotiations due to missing input track.');
            return false;
        }
        return true;
    }
    isFulfillingNegotiationQueued() {
        // If we're a polite client, then any queued negotiation is enough to fulfill our negotiation needs
        if (this.isPoliteClient()) {
            return this.highestSequence > this.highestProcessedSequence;
        }
        // If there's an impolite negotiation queued, that's good enough for any client
        return this.highestImpoliteSequence > this.highestProcessedSequence;
    }
    onWebRTCNegotiationNeeded() {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.onWebRTCNegotiationNeeded');
        if (!this.isConfigured()) {
            return;
        }
        // If we haven't processed any negotiation yet, then we can ignore any negotiation request
        if (!this.highestNegotiationId || !this.highestKnownNegotiationId) {
            return;
        }
        // If we already have a queued negotiation that would fulfill this need, then don't do anything
        if (this.isFulfillingNegotiationQueued()) {
            return;
        }
        // When requesting a renegotiation, always use the newest negotiation id we know that doesn't fulfill our need
        this.emitter.emit('negotiation-needed', { oldNegotiationId: this.highestKnownNegotiationId });
    }
    onWebRTCInternalError({ critical, error }) {
        var _a;
        (_a = this.config.logger) === null || _a === void 0 ? void 0 : _a.debug('NegotiationManager.onWebRTCInternalError', critical, error);
        const errorCode = typeof error === 'object' ? error.message : error;
        const negotiationId = this.currentNegotiationId;
        if (negotiationId) {
            this.emitter.emit('error', { errorCode, negotiationId });
        }
    }
}
class WebRTCNegotiationManager extends NegotiationManager {
}
//# sourceMappingURL=NegotiationManager.js.map