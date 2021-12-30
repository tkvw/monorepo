import { browser } from '$app/env';
import type { IRefreshTokens } from '@tkvw/rxjs-apollo';
import { BehaviorSubject, skip } from 'rxjs';

const AUTH_TOKEN_KEY = '_authToken';
const REFRESH_TOKEN_KEY = '_refreshToken';

export const tokens$ = new BehaviorSubject<IRefreshTokens>({
  authToken: browser ? sessionStorage.getItem(AUTH_TOKEN_KEY) : undefined,
  refreshToken: browser ? localStorage.getItem(REFRESH_TOKEN_KEY) : undefined
});

tokens$.pipe(skip(1)).subscribe(({ authToken, refreshToken }) => {
  if (authToken) sessionStorage.setItem(AUTH_TOKEN_KEY, authToken);
  else sessionStorage.removeItem(AUTH_TOKEN_KEY);

  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
});
