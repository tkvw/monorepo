import { Observable } from 'rxjs';

export function debug(message: string): <T>(observable: Observable<T>) => Observable<T> {
  return (next) =>
    new Observable((observer) => {
      return next.subscribe({
        next: (value) => {
          console.log(message, ' [NEXT] ', value);
          observer.next(value);
        },
        error: (error) => {
          console.error(message, ' [ERR] ', error);
          observer.error(error);
        },
        complete: () => {
          console.log(message, ' [COMPLETED] ');
          observer.complete();
        }
      });
    });
}
