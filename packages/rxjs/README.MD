
## Retry

```ts
import createRetry from "@tkvw/rxjs/operators/retry";

const {attempt,retry} = createRetry(cancel,m => ({
    ...m,
    message: "additional data"
}));

const subscription = attempt.subscribe(({attempt,error,cancel}) => {
    if(attempt>=10){
        cancel();
    }
});

of(1)
    .pipe(retry)
    .subscribe();

```