let duration = 120;
let remaining = 120;
let intervalId = null;
let onTick = null;
let onDone = null;

export function setCallbacks(tickCb, doneCb) {
  onTick = tickCb;
  onDone = doneCb;
}

export function setDuration(seconds) {
  duration = seconds;
  remaining = seconds;
  if (onTick) onTick(remaining);
}

export function getRemaining() {
  return remaining;
}

export function isRunning() {
  return intervalId !== null;
}

export function start() {
  if (intervalId) return;
  intervalId = setInterval(() => {
    remaining--;
    if (onTick) onTick(remaining);
    if (remaining <= 0) {
      stop();
      if (onDone) onDone();
    }
  }, 1000);
}

export function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function reset() {
  stop();
  remaining = duration;
  if (onTick) onTick(remaining);
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
