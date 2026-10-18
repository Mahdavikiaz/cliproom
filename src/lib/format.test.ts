import { describe, expect, it } from 'vitest';
import { formatBytes, formatDuration, formatDurationMs } from './format';

describe('formatDuration', () => {
  it('mm:ss', () => {
    expect(formatDuration(15)).toBe('00:15');
    expect(formatDuration(75)).toBe('01:15');
  });
  it('hh:mm:ss', () => {
    expect(formatDuration(3725)).toBe('1:02:05');
  });
  it('tidak valid → undefined', () => {
    expect(formatDuration(undefined)).toBeUndefined();
    expect(formatDuration(NaN)).toBeUndefined();
    expect(formatDuration(-1)).toBeUndefined();
  });
});

describe('formatDurationMs', () => {
  it('mengonversi milidetik ke detik sekali saja', () => {
    expect(formatDurationMs(15256)).toBe('00:15');
    expect(formatDurationMs(90_000)).toBe('01:30');
  });
  it('field hilang → undefined', () => {
    expect(formatDurationMs(undefined)).toBeUndefined();
  });
});

describe('formatBytes', () => {
  it('B / KB / MB', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
  it('tidak valid → undefined', () => {
    expect(formatBytes(undefined)).toBeUndefined();
    expect(formatBytes(NaN)).toBeUndefined();
  });
});
