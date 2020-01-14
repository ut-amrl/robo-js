import { Binop, Expr, Stmt } from './ast';
import { Set } from 'immutable';
import { Result, ok, error, unreachable } from './result';
import * as result from './result';

function tcExpr(boundVars: Set<string>, expr: Expr): Result<undefined> {
    if (expr.kind === 'number') {
        return ok(undefined);
    }
    else if (expr.kind === 'boolean') {
        return ok(undefined);
    }
    else if (expr.kind === 'variable') {
        if (boundVars.contains(expr.name)) {
            return ok(undefined);
        }
        else {
            return error(`variable ${expr.name} is not declared`);
        }
    }
    else if (expr.kind === 'operator') {
        return tcExpr(boundVars, expr.e1)
            .then(_ => tcExpr(boundVars, expr.e2));
    }
    else {
        return unreachable('unhandled case in tcExpr');
    }
}

type Env = {
    // Lexically scoped variables.
    bound: Set<string>,
    // All variables declared so far, to prevent students from declaring
    // two variables with the same name in differnt scopes.
    all: Set<string>
}

function tcBlock(env: Env, statements: Stmt[]): Result<Env> {
    return result.foldLeft(tcStmt, env, statements);
}

// We return the environement because 'let' statements declare variables that
// are visible to the next statement.
function tcStmt(env: Env, stmt: Stmt): Result<Env> {
    const { bound, all } = env;
    if (stmt.kind === 'let') {
        const x = stmt.name;
        if (all.contains(x)) {
            return error(`variable ${x} is re-declared`);
        }
        return tcExpr(bound, stmt.expression)
            .map(_ => ({ bound: bound.add(x), all: all.add(x) }));
    }
    else if (stmt.kind === 'assignment') {
        const x = stmt.name;
        if (bound.contains(x) === false) {
            return error(`variable ${x} is not declared`);
        }
        return tcExpr(bound, stmt.expression).map(_ => env);
    }
    else if (stmt.kind === 'if') {
        return tcExpr(bound, stmt.test)
            .then(_ => tcBlock(env, stmt.truePart))
            .then(({ all }) => tcBlock({ bound, all }, stmt.falsePart))
            .map(({ all }) => ({ bound, all }));
    }
    else if (stmt.kind === 'while') {
        // NOTE(arjun): Same trick as above.
        return tcExpr(bound, stmt.test)
            .then(_ => tcBlock(env, stmt.body))
            .map(({ all }) => ({ bound, all }));
    }
    else if (stmt.kind === 'print') {
        return tcExpr(bound, stmt.expression)
            .map(_ => env);
    }
    else {
        return unreachable('unhandled case in tcStmt');
    }
}

/**
 * A very naive "type-checker", which only ensures that (1) variables are
 * declared before they are used and that (2) there are no pairs of let
 * statements in different scopes that declare two variables with the same name.
 */
export function tc(stmts: Stmt[]): Result<undefined> {
    return tcBlock({ bound: Set.of(), all: Set.of() }, stmts)
        .map(_ => undefined);
}