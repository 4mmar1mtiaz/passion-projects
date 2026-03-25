'use client';

// Singleton audio engine — shared across all instruments and the recorder.
// All instrument audio routes through masterBus → speakers + recordDest (for recording).

let _ac: AudioContext | null = null;
let _masterBus: GainNode | null = null;
let _recordDest: MediaStreamAudioDestinationNode | null = null;

export function getEngine() {
  if (typeof window === 'undefined') return null;
  if (!_ac) {
    _ac = new AudioContext();
    _masterBus = _ac.createGain();
    _recordDest = _ac.createMediaStreamDestination();
    _masterBus.connect(_ac.destination);
    _masterBus.connect(_recordDest);
  }
  // Resume if suspended (browser autoplay policy)
  if (_ac.state === 'suspended') _ac.resume();
  return { ac: _ac, masterBus: _masterBus!, recordDest: _recordDest! };
}
