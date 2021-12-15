import { BehaviorSubject, of } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';

import createRetry from '../../operators/createRetry';

describe('createRetry', () => {
  it(
    'test simple',
    marbles((m) => {
      const source = m.cold('a--b--c|');
      const expected = m.cold('a--b--c|');
      m.expect(source).toBeObservable(expected);
    })
  );
  it('works with exponential backoff',
    marbles((m) => {
      const source = m.cold('a-#');
      const { createLink } = createRetry({
        maxAttempts: of(4)
      });
      const expected = m.cold('a- 1000ms a- 4000ms a- 9000ms a- 16000ms a-#');
      const expect = source.pipe(createLink());
      m.expect(expect).toBeObservable(expected);
    })
  );
  it('allows changing of attempts mid flight',marbles(m => {
    const source = m.cold('a-#');
    const maxAttempts$ = new BehaviorSubject(2);

    const { createLink,retryMessages } = createRetry({
      maxAttempts: maxAttempts$
    });
    retryMessages.subscribe(message => {
      if(message.attempt === 1 && maxAttempts$.getValue()<3){
        maxAttempts$.next(3);
      }
    });
    const expected = m.cold('a- 1000ms a- 4000ms a- 9000ms a-#');
    m.expect(source.pipe(createLink())).toBeObservable(expected);
  }));

  //   it('throttle',marbles((m)=> {
  //     const source = m.hot('--a--b--c--d--e--f--g--');
  //     const sub1 =         '---^--------!';
  //     const sub2 =         '---------^--------!';
  //     const expect1 =      '-----b--c--d';
  //     const expect2 =      '-----------d--e--f-';

  //     m.expect(source, sub1).toBeObservable(expect1);
  //     m.expect(source, sub2).toBeObservable(expect2);
  //   }))

  //   it.skip('should replay the previous value when subscribed', marbles(m => {
  //     const behaviorSubject = new BehaviorSubject('0');
  //     function feedNextIntoSubject(x: string) { behaviorSubject.next(x); }
  //     function feedErrorIntoSubject(err: any) { behaviorSubject.error(err); }
  //     function feedCompleteIntoSubject() { behaviorSubject.complete(); }

  //     const sourceTemplate =    '-1-2-3----4------5-6---7--8----9--|';
  //     const subscriber1 = m.hot('-----^(a|)').pipe(mergeMapTo(behaviorSubject));
  //     const unsub1 =            '----------------------------------!';
  //     const expected1   =       '-----3----4------5-6---7--8----9--|';

  //     m.expect(m.hot(sourceTemplate).pipe(
  //       tap({
  //         next: feedNextIntoSubject,
  //         error:  feedErrorIntoSubject,
  //         complete: feedCompleteIntoSubject
  //       })
  //     )).toBeObservable(sourceTemplate);
  //     m.expect(subscriber1, unsub1).toBeObservable(expected1);
  // //    m.expect(subscriber2, unsub2).toBeObservable(expected2);
  // //    m.expect(subscriber3).toBeObservable(expected3);
  //   }));

  //   // it('timer',marbles(m=>{
  //   //   const input = ' -a-b-c|';
  //   //   const expected = '- 10ms a-b-(c|)';

  //   //   // Depending on your personal preferences you could also
  //   //   // use frame dashes to keep vertical alignment with the input.
  //   //   // const input = ' -a-b-c|';
  //   //   // const expected = '------- 4ms a 9ms b 9ms (c|)';
  //   //   // or
  //   //   // const expected = '-----------a 9ms b 9ms (c|)';

  //   //   const result = m.cold(input).pipe(
  //   //     delay(10)
  //   //   );

  //   //   m.expect(result).toBeObservable(expected);
  //   // }));
  //   it('should error',marbles(m => {
  //     let counter = 0;
  //     const ec$ = new Observable(observer=>{
  //       console.log("observer is connected",counter);
  //       if(counter++>=3) {
  //         console.log("observer is completed",counter);
  //         observer.complete();
  //       }
  //       observer.error(`counter less then 3 (${counter})`);
  //       return () => {
  //         console.log("cleanup is called",counter);
  //       }
  //     });
  //     const delay$ = new BehaviorSubject(10);
  //     const clog = (message:string) => (...args:any[]) => console.log(message,...args);
  //     const log = (message: string) => tap(clog(message));
  //     const expected = m.cold('---|');
  //     const testable = ec$.pipe(
  //       retryWhen(errors$ => errors$.pipe(
  //         tap(clog("error start")),
  //         finalize(clog("finalized error")),
  //         concatMap((error,counter) => {
  //           delay$.next(counter*10);
  //           return iif(
  //             () => counter<3,
  //             delay$.pipe(
  //               log(counter+':before switchmap delay'),
  //               switchMap(delay => timer(delay).pipe(log(counter+": timer finished"),finalize(clog(counter+":timer finalized")))),
  //               log(counter+':after switchmap delay'),
  //               finalize(clog(counter+":finished"))
  //             ),
  //             throwError(() => error)
  //           );
  //         })
  //       ))
  //     );

  //     return testable.subscribe({
  //       error: () => testable.subscribe({}),
  //       complete:() => testable.subscribe({})
  //     });

  //     // const maxAttempts = cold('a',{a:3});

  //     // const source = cold('b-#');
  //     // const expected = cold('b-b-b-b-#')

  //     // const {retry} = createRetry({
  //     //   maxAttempts
  //     // });
  //     // expect(source.pipe(retry)).toBeObservable(expected);

  //   }));
});

// /** @test {mapTo} */
// describe('mapTo', () => {
//   it('Should merge two hot observables and start emitting from the subscription point', () => {

//     const e1 = hot('----a--^--b-------c--|');
//     const e2 = hot('  ---d-^--e---------f-----|');
//     const expected = cold('---(be)----c-f-----|');

//     expect(merge(e1,e2)).toBeObservable(expected);
//   });
// });
