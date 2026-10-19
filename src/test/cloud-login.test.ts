import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

const source = readFileSync(resolve('public/app/cloud.js'), 'utf8');

async function boot() {
  localStorage.clear();
  document.body.innerHTML = '<div id="auth-container"></div>';
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ ok: true, data: {} }) });
  vi.stubGlobal('fetch', fetchMock);
  const originalSet = Storage.prototype.setItem;
  const originalRemove = Storage.prototype.removeItem;
  const originalAdd = document.addEventListener;
  window.eval(source);
  await Promise.resolve();
  await Promise.resolve();
  return { fetchMock, restore: () => {
    Storage.prototype.setItem = originalSet;
    Storage.prototype.removeItem = originalRemove;
    document.addEventListener = originalAdd;
  }, cloud: (window as unknown as { vssCloud: { save: () => void; authenticate: (u: string, p: string) => Promise<boolean> } }).vssCloud };
}

afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('Single password cloud login', () => {
  it('queues saves without requesting permission while the login screen is open', async () => {
    vi.useFakeTimers();
    const { cloud, fetchMock, restore } = await boot();
    try {
      cloud.save();
      expect(fetchMock.mock.calls.map(([ , init]) => JSON.parse(init.body).action)).toEqual(['load']);
      expect(document.getElementById('vss-reauth')).toBeNull();
    } finally { restore(); }
  });

  it('uses one credential submission and waits for its token before allowing saves', async () => {
    vi.useFakeTimers();
    const { cloud, fetchMock, restore } = await boot();
    try {
      let finish: (value: unknown) => void = () => {};
      fetchMock.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
      const login = cloud.authenticate('test-user', 'test-password');
      document.getElementById('auth-container')?.classList.add('d-none');
      cloud.save();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      finish({ json: async () => ({ ok: true, token: 'test-write-token' }) });
      expect(await login).toBe(true);
      expect(localStorage.getItem('vss_write_token')).toBe('test-write-token');
      fetchMock.mockResolvedValue({ json: async () => ({ ok: true, updated_at: 'test-stamp' }) });
      cloud.save();
      expect(JSON.parse(fetchMock.mock.calls.at(-1)?.[1].body).token).toBe('test-write-token');
      expect(document.getElementById('vss-reauth')).toBeNull();
    } finally { restore(); }
  });
});