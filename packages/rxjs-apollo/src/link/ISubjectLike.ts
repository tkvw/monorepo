import type { ObservableInput,Observer } from 'rxjs';

export type ISubjectLike<T> = Observer<T> & ObservableInput<T>;
