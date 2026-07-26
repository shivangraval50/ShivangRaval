// A small but genuinely-working interpreter for a subset of the Monkey
// programming language (see https://monkeylang.org / "Writing An
// Interpreter In Go"), reimplemented from scratch in TypeScript so it can
// run live in the browser. This is a fresh reimplementation for this demo —
// it does not call the real OCaml lexer/parser/VM from the monkey-ocaml repo.
//
// Pipeline: source text -> Lexer (tokens) -> Parser (Pratt/recursive-descent,
// produces an AST) -> tree-walking evaluator (produces a MonkeyObject).
//
// Supported subset: integer literals, `let` bindings, arithmetic (+ - * /),
// comparisons (== != < >), booleans, prefix (- !), `if (cond) { } else { }`
// as an expression, `fn(params) { body }` closures with lexical scoping,
// function calls (including recursion), and `return`.

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

type TokenType =
  | "ILLEGAL"
  | "EOF"
  | "IDENT"
  | "INT"
  | "ASSIGN"
  | "PLUS"
  | "MINUS"
  | "BANG"
  | "ASTERISK"
  | "SLASH"
  | "LT"
  | "GT"
  | "EQ"
  | "NOT_EQ"
  | "COMMA"
  | "SEMICOLON"
  | "LPAREN"
  | "RPAREN"
  | "LBRACE"
  | "RBRACE"
  | "FUNCTION"
  | "LET"
  | "TRUE"
  | "FALSE"
  | "IF"
  | "ELSE"
  | "RETURN";

interface Token {
  type: TokenType;
  literal: string;
}

const KEYWORDS: Record<string, TokenType> = {
  fn: "FUNCTION",
  let: "LET",
  true: "TRUE",
  false: "FALSE",
  if: "IF",
  else: "ELSE",
  return: "RETURN",
};

function isLetter(ch: string): boolean {
  return /^[a-zA-Z_]$/.test(ch);
}
function isDigit(ch: string): boolean {
  return /^[0-9]$/.test(ch);
}

class Lexer {
  private input: string;
  private pos = 0;
  private readPos = 0;
  private ch = "\0";

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  private readChar(): void {
    this.ch = this.readPos >= this.input.length ? "\0" : this.input[this.readPos];
    this.pos = this.readPos;
    this.readPos += 1;
  }

  private peekChar(): string {
    return this.readPos >= this.input.length ? "\0" : this.input[this.readPos];
  }

  private skipWhitespace(): void {
    while (this.ch === " " || this.ch === "\t" || this.ch === "\n" || this.ch === "\r") {
      this.readChar();
    }
  }

  private readIdentifier(): string {
    const start = this.pos;
    while (isLetter(this.ch)) this.readChar();
    return this.input.slice(start, this.pos);
  }

  private readNumber(): string {
    const start = this.pos;
    while (isDigit(this.ch)) this.readChar();
    return this.input.slice(start, this.pos);
  }

  nextToken(): Token {
    this.skipWhitespace();
    let tok: Token;
    switch (this.ch) {
      case "=":
        if (this.peekChar() === "=") {
          this.readChar();
          tok = { type: "EQ", literal: "==" };
        } else {
          tok = { type: "ASSIGN", literal: "=" };
        }
        break;
      case "+":
        tok = { type: "PLUS", literal: "+" };
        break;
      case "-":
        tok = { type: "MINUS", literal: "-" };
        break;
      case "!":
        if (this.peekChar() === "=") {
          this.readChar();
          tok = { type: "NOT_EQ", literal: "!=" };
        } else {
          tok = { type: "BANG", literal: "!" };
        }
        break;
      case "/":
        tok = { type: "SLASH", literal: "/" };
        break;
      case "*":
        tok = { type: "ASTERISK", literal: "*" };
        break;
      case "<":
        tok = { type: "LT", literal: "<" };
        break;
      case ">":
        tok = { type: "GT", literal: ">" };
        break;
      case ";":
        tok = { type: "SEMICOLON", literal: ";" };
        break;
      case ",":
        tok = { type: "COMMA", literal: "," };
        break;
      case "(":
        tok = { type: "LPAREN", literal: "(" };
        break;
      case ")":
        tok = { type: "RPAREN", literal: ")" };
        break;
      case "{":
        tok = { type: "LBRACE", literal: "{" };
        break;
      case "}":
        tok = { type: "RBRACE", literal: "}" };
        break;
      case "\0":
        tok = { type: "EOF", literal: "" };
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentifier();
          return { type: KEYWORDS[literal] ?? "IDENT", literal };
        } else if (isDigit(this.ch)) {
          const literal = this.readNumber();
          return { type: "INT", literal };
        } else {
          tok = { type: "ILLEGAL", literal: this.ch };
        }
    }
    this.readChar();
    return tok;
  }
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

interface Identifier {
  kind: "Identifier";
  value: string;
}
interface IntegerLiteral {
  kind: "IntegerLiteral";
  value: number;
}
interface BooleanLiteral {
  kind: "BooleanLiteral";
  value: boolean;
}
interface PrefixExpression {
  kind: "PrefixExpression";
  operator: string;
  right: Expression;
}
interface InfixExpression {
  kind: "InfixExpression";
  operator: string;
  left: Expression;
  right: Expression;
}
interface IfExpression {
  kind: "IfExpression";
  condition: Expression;
  consequence: BlockStatement;
  alternative: BlockStatement | null;
}
interface FunctionLiteral {
  kind: "FunctionLiteral";
  parameters: Identifier[];
  body: BlockStatement;
}
interface CallExpression {
  kind: "CallExpression";
  fn: Expression;
  args: Expression[];
}

type Expression =
  | Identifier
  | IntegerLiteral
  | BooleanLiteral
  | PrefixExpression
  | InfixExpression
  | IfExpression
  | FunctionLiteral
  | CallExpression;

interface LetStatement {
  kind: "LetStatement";
  name: Identifier;
  value: Expression;
}
interface ReturnStatement {
  kind: "ReturnStatement";
  value: Expression;
}
interface ExpressionStatement {
  kind: "ExpressionStatement";
  expression: Expression;
}

type Statement = LetStatement | ReturnStatement | ExpressionStatement;

interface BlockStatement {
  kind: "BlockStatement";
  statements: Statement[];
}
interface Program {
  kind: "Program";
  statements: Statement[];
}

type Node = Program | Statement | BlockStatement | Expression;

// ---------------------------------------------------------------------------
// Parser (Pratt / recursive descent)
// ---------------------------------------------------------------------------

const LOWEST = 1;
const EQUALS = 2;
const LESSGREATER = 3;
const SUM = 4;
const PRODUCT = 5;
const PREFIX = 6;
const CALL = 7;

const PRECEDENCES: Partial<Record<TokenType, number>> = {
  EQ: EQUALS,
  NOT_EQ: EQUALS,
  LT: LESSGREATER,
  GT: LESSGREATER,
  PLUS: SUM,
  MINUS: SUM,
  SLASH: PRODUCT,
  ASTERISK: PRODUCT,
  LPAREN: CALL,
};

const INFIX_TOKENS: TokenType[] = ["EQ", "NOT_EQ", "LT", "GT", "PLUS", "MINUS", "SLASH", "ASTERISK", "LPAREN"];

export class MonkeyParseError extends Error {}

class Parser {
  private lexer: Lexer;
  private curToken!: Token;
  private peekToken!: Token;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.nextToken();
    this.nextToken();
  }

  private nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  private expectPeek(type: TokenType): void {
    if (this.peekToken.type === type) {
      this.nextToken();
      return;
    }
    throw new MonkeyParseError(
      `expected next token to be ${type}, got ${this.peekToken.type} ("${this.peekToken.literal}") instead`
    );
  }

  private peekPrecedence(): number {
    return PRECEDENCES[this.peekToken.type] ?? LOWEST;
  }
  private curPrecedence(): number {
    return PRECEDENCES[this.curToken.type] ?? LOWEST;
  }

  parseProgram(): Program {
    const statements: Statement[] = [];
    while (this.curToken.type !== "EOF") {
      statements.push(this.parseStatement());
      this.nextToken();
    }
    return { kind: "Program", statements };
  }

  private parseStatement(): Statement {
    switch (this.curToken.type) {
      case "LET":
        return this.parseLetStatement();
      case "RETURN":
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement {
    this.expectPeek("IDENT");
    const name: Identifier = { kind: "Identifier", value: this.curToken.literal };
    this.expectPeek("ASSIGN");
    this.nextToken();
    const value = this.parseExpression(LOWEST);
    if (this.peekToken.type === "SEMICOLON") this.nextToken();
    return { kind: "LetStatement", name, value };
  }

  private parseReturnStatement(): ReturnStatement {
    this.nextToken();
    const value = this.parseExpression(LOWEST);
    if (this.peekToken.type === "SEMICOLON") this.nextToken();
    return { kind: "ReturnStatement", value };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression(LOWEST);
    if (this.peekToken.type === "SEMICOLON") this.nextToken();
    return { kind: "ExpressionStatement", expression };
  }

  private parseExpression(precedence: number): Expression {
    let left = this.parsePrefix();
    while (this.peekToken.type !== "SEMICOLON" && precedence < this.peekPrecedence()) {
      const infixType = this.peekToken.type;
      if (!INFIX_TOKENS.includes(infixType)) return left;
      this.nextToken();
      if (infixType === "LPAREN") left = this.parseCallExpression(left);
      else left = this.parseInfixExpression(left);
    }
    return left;
  }

  private parsePrefix(): Expression {
    switch (this.curToken.type) {
      case "IDENT":
        return { kind: "Identifier", value: this.curToken.literal };
      case "INT": {
        const value = parseInt(this.curToken.literal, 10);
        if (Number.isNaN(value)) {
          throw new MonkeyParseError(`could not parse "${this.curToken.literal}" as integer`);
        }
        return { kind: "IntegerLiteral", value };
      }
      case "TRUE":
        return { kind: "BooleanLiteral", value: true };
      case "FALSE":
        return { kind: "BooleanLiteral", value: false };
      case "BANG":
      case "MINUS": {
        const operator = this.curToken.literal;
        this.nextToken();
        const right = this.parseExpression(PREFIX);
        return { kind: "PrefixExpression", operator, right };
      }
      case "LPAREN": {
        this.nextToken();
        const exp = this.parseExpression(LOWEST);
        this.expectPeek("RPAREN");
        return exp;
      }
      case "IF":
        return this.parseIfExpression();
      case "FUNCTION":
        return this.parseFunctionLiteral();
      default:
        throw new MonkeyParseError(`no prefix parse function for "${this.curToken.type}" ("${this.curToken.literal}") found`);
    }
  }

  private parseInfixExpression(left: Expression): Expression {
    const operator = this.curToken.literal;
    const precedence = this.curPrecedence();
    this.nextToken();
    const right = this.parseExpression(precedence);
    return { kind: "InfixExpression", operator, left, right };
  }

  private parseIfExpression(): Expression {
    this.expectPeek("LPAREN");
    this.nextToken();
    const condition = this.parseExpression(LOWEST);
    this.expectPeek("RPAREN");
    this.expectPeek("LBRACE");
    const consequence = this.parseBlockStatement();
    let alternative: BlockStatement | null = null;
    if (this.peekToken.type === "ELSE") {
      this.nextToken();
      this.expectPeek("LBRACE");
      alternative = this.parseBlockStatement();
    }
    return { kind: "IfExpression", condition, consequence, alternative };
  }

  private parseBlockStatement(): BlockStatement {
    const statements: Statement[] = [];
    this.nextToken();
    while (this.curToken.type !== "RBRACE" && this.curToken.type !== "EOF") {
      statements.push(this.parseStatement());
      this.nextToken();
    }
    if (this.curToken.type !== "RBRACE") {
      throw new MonkeyParseError('expected "}" to close block, reached end of input instead');
    }
    return { kind: "BlockStatement", statements };
  }

  private parseFunctionLiteral(): Expression {
    this.expectPeek("LPAREN");
    const parameters = this.parseFunctionParameters();
    this.expectPeek("LBRACE");
    const body = this.parseBlockStatement();
    return { kind: "FunctionLiteral", parameters, body };
  }

  private parseFunctionParameters(): Identifier[] {
    const identifiers: Identifier[] = [];
    if (this.peekToken.type === "RPAREN") {
      this.nextToken();
      return identifiers;
    }
    this.nextToken();
    identifiers.push({ kind: "Identifier", value: this.curToken.literal });
    while (this.peekToken.type === "COMMA") {
      this.nextToken();
      this.nextToken();
      identifiers.push({ kind: "Identifier", value: this.curToken.literal });
    }
    this.expectPeek("RPAREN");
    return identifiers;
  }

  private parseCallExpression(fn: Expression): Expression {
    const args = this.parseCallArguments();
    return { kind: "CallExpression", fn, args };
  }

  private parseCallArguments(): Expression[] {
    const args: Expression[] = [];
    if (this.peekToken.type === "RPAREN") {
      this.nextToken();
      return args;
    }
    this.nextToken();
    args.push(this.parseExpression(LOWEST));
    while (this.peekToken.type === "COMMA") {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression(LOWEST));
    }
    this.expectPeek("RPAREN");
    return args;
  }
}

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

interface IntegerObj {
  type: "INTEGER";
  value: number;
}
interface BooleanObj {
  type: "BOOLEAN";
  value: boolean;
}
interface NullObj {
  type: "NULL";
}
interface FunctionObj {
  type: "FUNCTION";
  parameters: Identifier[];
  body: BlockStatement;
  env: Environment;
}
interface ReturnValueObj {
  type: "RETURN_VALUE";
  value: MonkeyObject;
}

type MonkeyObject = IntegerObj | BooleanObj | NullObj | FunctionObj | ReturnValueObj;

const NULL: NullObj = { type: "NULL" };
const TRUE: BooleanObj = { type: "BOOLEAN", value: true };
const FALSE: BooleanObj = { type: "BOOLEAN", value: false };

export class MonkeyRuntimeError extends Error {}

class Environment {
  private store = new Map<string, MonkeyObject>();
  constructor(private outer: Environment | null = null) {}

  get(name: string): MonkeyObject | undefined {
    if (this.store.has(name)) return this.store.get(name);
    return this.outer ? this.outer.get(name) : undefined;
  }

  set(name: string, value: MonkeyObject): MonkeyObject {
    this.store.set(name, value);
    return value;
  }
}

function nativeBoolToObj(b: boolean): BooleanObj {
  return b ? TRUE : FALSE;
}

function isTruthy(obj: MonkeyObject): boolean {
  // Matches real Monkey semantics: only `false` and `null` are falsy —
  // integer 0 is truthy.
  if (obj === NULL) return false;
  if (obj === FALSE) return false;
  return true;
}

// Guards against a visitor typing genuinely non-terminating or absurdly
// deep recursion (e.g. a recursive function with no base case) hanging the
// tab — this is real user-supplied code running live, so it needs a floor.
const MAX_EVAL_STEPS = 300_000;
let stepCount = 0;

function evalNode(node: Node, env: Environment): MonkeyObject {
  stepCount += 1;
  if (stepCount > MAX_EVAL_STEPS) {
    throw new MonkeyRuntimeError(
      `evaluation aborted after ${MAX_EVAL_STEPS.toLocaleString()} steps (likely runaway or non-terminating recursion)`
    );
  }

  switch (node.kind) {
    case "Program":
      return evalProgram(node.statements, env);
    case "ExpressionStatement":
      return evalNode(node.expression, env);
    case "IntegerLiteral":
      return { type: "INTEGER", value: node.value };
    case "BooleanLiteral":
      return nativeBoolToObj(node.value);
    case "PrefixExpression": {
      const right = evalNode(node.right, env);
      return evalPrefixExpression(node.operator, right);
    }
    case "InfixExpression": {
      const left = evalNode(node.left, env);
      const right = evalNode(node.right, env);
      return evalInfixExpression(node.operator, left, right);
    }
    case "BlockStatement":
      return evalBlockStatement(node.statements, env);
    case "IfExpression":
      return evalIfExpression(node, env);
    case "LetStatement": {
      const value = evalNode(node.value, env);
      env.set(node.name.value, value);
      return value;
    }
    case "ReturnStatement": {
      const value = evalNode(node.value, env);
      return { type: "RETURN_VALUE", value };
    }
    case "Identifier": {
      const value = env.get(node.value);
      if (value === undefined) throw new MonkeyRuntimeError(`identifier not found: ${node.value}`);
      return value;
    }
    case "FunctionLiteral":
      return { type: "FUNCTION", parameters: node.parameters, body: node.body, env };
    case "CallExpression": {
      const fn = evalNode(node.fn, env);
      const args = node.args.map((a) => evalNode(a, env));
      return applyFunction(fn, args);
    }
    default: {
      const exhaustiveCheck: never = node;
      throw new MonkeyRuntimeError(`unknown node: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}

function evalProgram(statements: Statement[], env: Environment): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const stmt of statements) {
    result = evalNode(stmt, env);
    if (result.type === "RETURN_VALUE") return result.value;
  }
  return result;
}

function evalBlockStatement(statements: Statement[], env: Environment): MonkeyObject {
  let result: MonkeyObject = NULL;
  for (const stmt of statements) {
    result = evalNode(stmt, env);
    if (result.type === "RETURN_VALUE") return result;
  }
  return result;
}

function evalPrefixExpression(operator: string, right: MonkeyObject): MonkeyObject {
  if (operator === "!") return nativeBoolToObj(!isTruthy(right));
  if (operator === "-") {
    if (right.type !== "INTEGER") throw new MonkeyRuntimeError(`unknown operator: -${right.type}`);
    return { type: "INTEGER", value: -right.value };
  }
  throw new MonkeyRuntimeError(`unknown operator: ${operator}`);
}

function evalInfixExpression(operator: string, left: MonkeyObject, right: MonkeyObject): MonkeyObject {
  if (left.type === "INTEGER" && right.type === "INTEGER") {
    return evalIntegerInfixExpression(operator, left, right);
  }
  if (operator === "==") return nativeBoolToObj(left === right);
  if (operator === "!=") return nativeBoolToObj(left !== right);
  if (left.type !== right.type) {
    throw new MonkeyRuntimeError(`type mismatch: ${left.type} ${operator} ${right.type}`);
  }
  throw new MonkeyRuntimeError(`unknown operator: ${left.type} ${operator} ${right.type}`);
}

function evalIntegerInfixExpression(operator: string, left: IntegerObj, right: IntegerObj): MonkeyObject {
  switch (operator) {
    case "+":
      return { type: "INTEGER", value: left.value + right.value };
    case "-":
      return { type: "INTEGER", value: left.value - right.value };
    case "*":
      return { type: "INTEGER", value: left.value * right.value };
    case "/":
      if (right.value === 0) throw new MonkeyRuntimeError("division by zero");
      return { type: "INTEGER", value: Math.trunc(left.value / right.value) };
    case "<":
      return nativeBoolToObj(left.value < right.value);
    case ">":
      return nativeBoolToObj(left.value > right.value);
    case "==":
      return nativeBoolToObj(left.value === right.value);
    case "!=":
      return nativeBoolToObj(left.value !== right.value);
    default:
      throw new MonkeyRuntimeError(`unknown operator: INTEGER ${operator} INTEGER`);
  }
}

function evalIfExpression(node: IfExpression, env: Environment): MonkeyObject {
  const condition = evalNode(node.condition, env);
  if (isTruthy(condition)) return evalNode(node.consequence, env);
  if (node.alternative) return evalNode(node.alternative, env);
  return NULL;
}

function applyFunction(fn: MonkeyObject, args: MonkeyObject[]): MonkeyObject {
  if (fn.type !== "FUNCTION") throw new MonkeyRuntimeError(`not a function: ${fn.type}`);
  if (fn.parameters.length !== args.length) {
    throw new MonkeyRuntimeError(`wrong number of arguments: expected ${fn.parameters.length}, got ${args.length}`);
  }
  const extendedEnv = new Environment(fn.env);
  fn.parameters.forEach((p, i) => extendedEnv.set(p.value, args[i]));
  const evaluated = evalNode(fn.body, extendedEnv);
  if (evaluated.type === "RETURN_VALUE") return evaluated.value;
  return evaluated;
}

function inspect(obj: MonkeyObject): string {
  switch (obj.type) {
    case "INTEGER":
      return String(obj.value);
    case "BOOLEAN":
      return String(obj.value);
    case "NULL":
      return "null";
    case "FUNCTION":
      return `fn(${obj.parameters.map((p) => p.value).join(", ")}) { ... }`;
    case "RETURN_VALUE":
      return inspect(obj.value);
  }
}

export type MonkeyRunResult = { ok: true; output: string } | { ok: false; error: string };

/** Lexes, parses, and evaluates a Monkey source string, entirely client-side. */
export function runMonkey(code: string): MonkeyRunResult {
  stepCount = 0;
  try {
    const lexer = new Lexer(code);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const env = new Environment();
    const result = evalNode(program, env);
    return { ok: true, output: inspect(result) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
