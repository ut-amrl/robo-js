export type Binop = '+' | '-' | '*' | '/' | '&&' | '||' | '>' | '<' | '===';

export type Expr =
    { kind: 'boolean', value: boolean } |
    { kind: 'number', value: number } |
    { kind: 'variable', name: string } |
    { kind: 'operator', op: Binop, e1: Expr, e2: Expr };

export type Stmt =
    { kind: 'let', name: string, expression: Expr } |
    { kind: 'assignment', name: string, expression: Expr } |
    { kind: 'if', test: Expr, truePart: Stmt[], falsePart: Stmt[] } |
    { kind: 'while', test: Expr, body: Stmt[] } |
    { kind: 'print', expression: Expr };

export function bool(value: boolean): Expr {
    return { kind: 'boolean', value };
}

export function number(value: number): Expr {
    return { kind: 'number', value };
}

export function variable(name: string): Expr {
    return { kind: 'variable', name };
}

export function operator(op: Binop, e1: Expr, e2: Expr): Expr {
    return { kind: 'operator', op, e1, e2 };
}

export function let_(name: string, expression: Expr): Stmt {
    return { kind: 'let', name, expression };
}

export function assignment(name: string, expression: Expr): Stmt {
    return { kind: 'assignment', name, expression };
}

export function if_(test: Expr, truePart: Stmt[], falsePart: Stmt[]): Stmt {
    return { kind: 'if', test, truePart, falsePart };
}

export function while_(test: Expr, body: Stmt[]): Stmt {
    return { kind: 'while', test, body };
}

export function print(expression: Expr): Stmt {
    return { kind: 'print', expression };
}