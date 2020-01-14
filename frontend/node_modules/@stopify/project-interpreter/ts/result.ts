// This should be a library.

export function unreachable(message: string): never {
    throw new Error(message);
}

export type Result<T>  = {
    kind: 'ok';
    value: T;
    unsafeGet(): T;
    then<S>(other: (value: T) => Result<S>): Result<S>;
    map<S>(f: (value: T) => S): Result<S>;
} | {
    kind: 'error';
    message: string;
    unsafeGet(): T;
    then<S>(other: (value: T) => Result<S>): Result<S>;
    map<S>(f: (value: T) => S): Result<S>;
};

class OK<T> {
    public kind: 'ok' = 'ok';
    constructor(public value: T) { }

    unsafeGet(): T {
        return this.value;
    }

    then<S>(other: (value: T) => Result<S>): Result<S> {
        return other(this.value);
    }

    map<S>(f: (value: T) => S): Result<S> {
        return new OK(f(this.value));
    }
}

class Error {
    public kind: 'error' = 'error';
    constructor(public message: string) { }

    unsafeGet(): never {
        throw new Error(`Called unsafeGet on Error(${this.message})`);
    }

    then<S>(other: (value: never) => Result<S>): Result<S> {
        return this;
    }

    map<S>(f: (value: never) => S): Result<S> {
        return this;
    }
}

export function ok<T>(value: T) {
    return new OK(value);
}

export function error<T>(message: string): Result<T> {
    return new Error(message);
}

export function foldLeft<S,T>(
    f: (acc: S, value: T) => Result<S>,
    init: S,
    array: T[]): Result<S> {
    let acc = init;
    for (const x of array) {
        let r = f(acc, x);
        if (r.kind === 'error') {
            return r;
        }
        acc = r.value;
    }
    return ok(acc);
}