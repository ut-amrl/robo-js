import * as P from 'parsimmon';
import { Expr, Stmt } from './ast';
import * as a from './ast';
import { Result, ok, error, unreachable } from './result';
import * as result from './result';
import * as tc from './tc';

let ws = P.optWhitespace;

function token(name_tok: string): P.Parser<string> {
    return ws.then(P.string(name_tok)).skip(ws);
}

// NOTE(arjun): token and operator as identical ... mistake?
function operator(name_op: string): P.Parser<string> {
    return P.string(name_op).skip(ws);
}

let num: P.Parser<Expr> = P.regexp(/-?[0-9]+/).desc('integer').skip(ws)
    .map(str => a.number(Number(str)));

let name: P.Parser<string> = P.regexp(/[A-Za-z]+/).desc('variable name').skip(ws);

let bool: P.Parser<Expr> =
    P.string('true').map(_ => true).or(P.string('false').map(_ => false))
    .skip(ws).map(b => a.bool(b));

let atom: P.Parser<Expr> =
    ws.then(bool
    .or(name.map(str => a.variable(str)))
    .or(num)
    .or(P.lazy(() => expr.wrap(operator('('), operator(')')))));

let mul: P.Parser<Expr> = P.lazy(() =>
    atom.chain(lhs => // get left hand side with atom
        P.seq(operator('*').or(operator('/')), atom).many().map((opNumArr) => {
            // get as many sequences of operator x atom pairs
            return opNumArr.reduce((acc, currVal) => {
                // reduce over the array of pairs
                if (currVal[0] === '*') {
                    return a.operator('*', acc, currVal[1]); // build tree with acc as lhs
                }
                return a.operator('/', acc, currVal[1]);
            }, lhs);
        })));

let add: P.Parser<Expr> = P.lazy(() =>
    mul.chain(lhs =>
        P.seq(operator('+').or(operator('-')), mul).many().map((opNumArr) => {
            // get many sequences of operator x multiplication expression pairs
            return opNumArr.reduce((acc, currVal) => {
                if (currVal[0] === '+') {
                    return a.operator('+', acc, currVal[1]);
                }
                return a.operator('-', acc, currVal[1]);
            }, lhs);
        })));

let cmp: P.Parser<Expr> = P.lazy(() =>
    add.chain(lhs =>
        P.seq(operator('>').or(operator('<')).or(operator('===')), add).many().map((opNumArr) => {
            return opNumArr.reduce((acc, currVal) => {
                if (currVal[0] === '>') {
                    return a.operator('>', acc, currVal[1]);
                }
                if (currVal[0] === '<') {
                    return a.operator('<', acc, currVal[1]);
                }
                return a.operator('===', acc, currVal[1]);
            }, lhs);
        })));

let or: P.Parser<Expr> = P.lazy(() =>
    cmp.chain(lhs =>
        P.seq(operator('||'), cmp).many().map((opNumArr) => {
            return opNumArr.reduce((acc, currVal) => a.operator('||', acc, currVal[1]), lhs);
        })));

let and: P.Parser<Expr> = P.lazy(() =>
    or.chain(lhs =>
        P.seq(operator('&&'), or).many().map((opNumArr) => {
            return opNumArr.reduce((acc, currVal) => a.operator('&&', acc, currVal[1]), lhs);
        })));

let expr = and;

let stmt: P.Parser<Stmt> = P.lazy(() =>
    token('let')
    .then(name.skip(operator('='))
    .chain(name =>
        expr.skip(operator(';'))
        .map(expression => a.let_(name, expression))))
    .or(token('if')
        .then(expr.wrap(operator('('), operator(')')))
        .chain(test =>
            block.skip(token('else'))
            .chain(truePart =>
                block
                .map(falsePart => a.if_(test, truePart, falsePart)))))
    .or(token('while')
        .then(expr.wrap(operator('('), operator(')')))
        .chain(test =>
            block
            .map(body => a.while_(test, body))))
    .or(token('print')
        .then(expr.wrap(operator('('), operator(')')))
        .skip(operator(';'))
        .map(expression => ({ kind: 'print' as 'print', expression })))
    .or(name.skip(operator('='))
        .chain(name =>
            expr.skip(operator(';'))
            .map(expression => a.assignment(name, expression)))));

let block: P.Parser<Stmt[]> = P.lazy(() =>
    stmt.many().wrap(operator('{'), operator('}')));

function commaOr(strings: string[]): string {
    if (strings.length <= 1) {
        return strings.join('');
    }
    let last = strings.pop();
    return strings.join(', ') + ', or ' + last;
}

/**
 * Students will not use this function in the project. We will use this in class
 * to illustrate ASTs.
 */
export function parseExpression(input: string): Result<Expr> {
    let result = expr.skip(P.eof).parse(input);
    if (result.status) {
        return ok(result.value);
    }
    else {
        return error('Parse error. Expected ' + commaOr(result.expected));
    }
}

/**
 * Parse and type-check simple imperative programs. This is the function
 * that students will use for the project.
 */
export function parseProgram(input: string): Result<Stmt[]> {
    let result = stmt.many().skip(P.eof).parse(input);
        if (result.status) {
            const stmts = result.value;
            return tc.tc(stmts).map(_ => stmts);
        }
        else {
            return error('Parse error. Expected ' + commaOr(result.expected));
        }
}
