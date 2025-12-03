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
export class Negotiation {
    get started() {
        return this._startedProcessing;
    }
    /** Returns true when the negotiation will no longer process anything, no matter the reason */
    get ended() {
        return this._ended;
    }
    get isLocal() {
        return !this.remoteOffer;
    }
    constructor(negotiation, logger) {
        this.logger = logger;
        this.webrtcProcessor = null;
        this._startedProcessing = false;
        this._ended = false;
        this._failed = false;
        this.negotiationId = negotiation.negotiationId;
        this.sequence = negotiation.sequence;
        this.isPolite = negotiation.isPolite;
        this.remoteOffer = negotiation.remoteOffer;
        this.emitter = new Emitter();
    }
    end() {
        var _a;
        if (this._ended) {
            return;
        }
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Negotiation.end', this.negotiationId);
        this._ended = true;
        this.emitter.emit('ended');
    }
    process(webrtcProcessor) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this._startedProcessing) {
                return;
            }
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Negotiation.process', this.negotiationId);
            this.setWebRTCProcessor(webrtcProcessor);
            this._startedProcessing = true;
            if (this.remoteOffer) {
                yield this.createLocalAnswer(this.remoteOffer);
                return;
            }
            // after creating the local offer, this negotiation will remain active until it receives an answer
            yield this.createLocalOffer();
        });
    }
    setRemoteAnswer(sdp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!this.webrtcProcessor) {
                return;
            }
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Negotiation.setRemoteAnswer', this.negotiationId);
            if (!this.isLocal || !this._startedProcessing || sdp.type !== 'answer') {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.warn('Invalid negotiation workflow');
                return;
            }
            yield this.webrtcProcessor.setRemoteDescription(sdp);
            // Local negotiations end when the remote description is available
            this.end();
        });
    }
    setLocalDescription(sdp) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Negotiation.setLocalDescription', this.negotiationId);
            this.assertNegotiationIsActive();
            yield this.webrtcProcessor.setLocalDescription(sdp);
            this.assertNegotiationIsActive();
            yield this.webrtcProcessor.waitForIceGathering();
            this.assertNegotiationIsActive();
            const localDescription = this.webrtcProcessor.getLocalDescription();
            if (!localDescription) {
                this.fail('implementation-error');
                return;
            }
            this.emitter.emit('local-sdp', { sdp: localDescription });
            // Remote negotiations end when the local description is available
            if (!this.isLocal) {
                this.end();
            }
        });
    }
    setWebRTCProcessor(webrtcProcessor) {
        this.webrtcProcessor = webrtcProcessor;
    }
    assertNegotiationIsActive() {
        if (this._ended) {
            this.fail('skipped-negotiation');
            throw new Error('Skipped Negotiation');
        }
    }
    createLocalOffer() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Negotiation.createLocalOffer', this.negotiationId);
            this.assertNegotiationIsActive();
            const earlyOffer = yield this.webrtcProcessor.createOffer({});
            yield this.setLocalDescription(earlyOffer);
        });
    }
    createLocalAnswer(remoteOffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.debug('Negotiation.createLocalAnswer', this.negotiationId);
            this.assertNegotiationIsActive();
            yield this.webrtcProcessor.setRemoteDescription(remoteOffer);
            this.assertNegotiationIsActive();
            const earlyAnswer = yield this.webrtcProcessor.createAnswer();
            this.assertNegotiationIsActive();
            yield this.setLocalDescription(earlyAnswer);
        });
    }
    fail(errorCode) {
        if (this._failed || this._ended) {
            return;
        }
        this.emitter.emit('error', { errorCode });
        this._failed = true;
    }
}
export class WebRTCNegotiation extends Negotiation {
}
//# sourceMappingURL=Negotiation.js.map