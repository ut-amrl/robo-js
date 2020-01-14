import { parseProgram, parseExpression } from './index';
import * as a from './ast';

test('trivial let', () => {
    let r = parseProgram('let x = 23;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', a.number(23))
    ]);
});

test('trivial let true', () => {
    let r = parseProgram('let x = true;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', a.bool(true))
    ]);
});

test('trivial if', () => {
    let r = parseProgram('let x = 10; if (x) { x = 2; } else { x = 4; }');
    expect(r.kind).toBe('ok');
});

test('trivial while', () => {
    let r = parseProgram('let x = 1; while(x) { }');
    expect(r.kind).toBe('ok');
});

test('trivial assignment', () => {
    let r = parseProgram('let x = 1; x = x + 1;');
    expect(r.kind).toBe('ok');
});

test('trivial print', () => {
    let r = parseProgram('print(1 + 2);');
    expect(r.kind).toBe('ok');
});

test('arithmetic precedence', () => {
    let r = parseProgram('let x = 1 + 2 * 3;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', a.operator('+', a.number(1),
            a.operator('*', a.number(2), a.number(3))))
    ]);
});

test('logical precedence', () => {
    let r = parseProgram('let x = true || false && true;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', a.operator('&&',
            a.operator('||', a.bool(true), a.bool(false)),
            a.bool(true)))]);
});

test('comparison', () => {
    let r = parseProgram('let x = 1 > 2;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', a.operator('>', a.number(1), a.number(2)))]);
});

test('subtraction binding', () => {
    let r = parseProgram('let x = 1 - 2 - 3;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', 
            a.operator('-', 
                a.operator('-', a.number(1), a.number(2)), 
                a.number(3)))
    ]);
});

test('must declare variables', () => {
    let r = parseProgram('let x = y + 2;');
    expect(r.kind).toBe('error');
});

test('cannot redeclare variables', () => {
    let r = parseProgram('let x = 1; let x = 2;');
    expect(r.kind).toBe('error');
});

test('cannot redeclare variables, even in different scopes', () => {
    let r = parseProgram('let x = 1; while (true) { let x = 2; }');
    expect(r.kind).toBe('error');
});

test('leading space in program', () => {
    let r = parseProgram('  let x = 1;');
    expect(r.kind).toBe('ok');
});

test('leading white space in expression', () => {
    let r = parseExpression(' 1 + 2');
    expect(r.kind).toBe('ok');
});

test('Left associative multiply', () => {
    let r = parseProgram('let x = 1 + 2 * 3;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', 
            a.operator('+', 
                a.number(1), 
                a.operator('*', a.number(2), a.number(3))))
    ]);
});

test('Left associative divide', () => {
    let r = parseProgram('let x = 1 + 2 / 3;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', 
            a.operator('+', 
                a.number(1), 
                a.operator('/', a.number(2), a.number(3))))
    ]);
});

test('Left associative plus minus', () => {
    let r = parseProgram('let x = 1 - 2 + 3;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', 
            a.operator('+', 
                a.operator('-', a.number(1), a.number(2)), 
                a.number(3)))
    ]);
});

test('Left associative complicated', () => {
    let r = parseProgram('let x = 2 === 3 || 2 - 1 * 2 > 2;');
    expect(r.kind).toBe('ok');
    expect(r.unsafeGet()).toEqual([
        a.let_('x', 
            a.operator('||', 
                a.operator('===', a.number(2), a.number(3)), 
                a.operator('>', 
                    a.operator('-', 
                        a.number(2), 
                        a.operator('*', a.number(1), a.number(2))), 
                    a.number(2))))
    ]);
});