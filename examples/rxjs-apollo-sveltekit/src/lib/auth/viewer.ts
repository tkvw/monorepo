import { BehaviorSubject, delay, startWith, tap } from 'rxjs';
import type { ViewerFragment } from '../generated.js';

export const _viewer = new BehaviorSubject<{
  viewer?: ViewerFragment;
  initialized?: boolean;
}>({
  initialized: false
});

export const viewer$ = _viewer.asObservable();
export const setViewer = (viewer?: ViewerFragment) => {
  _viewer.next({
    viewer: viewer ?? undefined,
    initialized: true
  });
};


export const counter = new BehaviorSubject(1);
export const counter$ = counter.asObservable();