import { Environment } from 'nunjucks';
import stripIndent from 'strip-indent';

interface TagFunction {
  (args: any[], content: string): string;
}

class NunjucksTag {
  public tags: string[];
  public fn: TagFunction;

  constructor(name: string, fn: TagFunction) {
    this.tags = [name];
    this.fn = fn;
  }

  parse(parser:any, nodes:any, lexer:any) {
    const node = this._parseArgs(parser, nodes, lexer);

    return new nodes.CallExtension(this, 'run', node, []);
  }

  _parseArgs(parser:any, nodes:any, lexer:any) {
    const tag = parser.nextToken();
    const node = new nodes.NodeList(tag.lineno, tag.colno);
    const argarray = new nodes.Array(tag.lineno, tag.colno);

    let token;
    let argitem = '';

    while ((token = parser.nextToken(true))) {
      if (token.type === lexer.TOKEN_WHITESPACE || token.type === lexer.TOKEN_BLOCK_END) {
        if (argitem !== '') {
          const argnode = new nodes.Literal(tag.lineno, tag.colno, argitem.trim());
          argarray.addChild(argnode);
          argitem = '';
        }

        if (token.type === lexer.TOKEN_BLOCK_END) {
          break;
        }
      } else {
        argitem += token.value;
      }
    }

    node.addChild(argarray);

    return node;
  }

  run(context:any, args:any, body:any, callback:any) {
    return this._run(context, args, '');
  }

  _run(context:any, args:any, body:any): any {
    return Reflect.apply(this.fn, context.ctx, [args, body]);
  }
}

const trimBody = (body: () => any) => {
  return stripIndent(body()).replace(/^\n?|\n?$/g, '');
};

class NunjucksBlock extends NunjucksTag {
  parse(parser:any, nodes:any, lexer:any) {
    const node = this._parseArgs(parser, nodes, lexer);
    const body = this._parseBody(parser, nodes, lexer);

    return new nodes.CallExtension(this, 'run', node, [body]);
  }

  _parseBody(parser:any, nodes:any, lexer:any) {
    const body = parser.parseUntilBlocks(`end${this.tags[0]}`);

    parser.advanceAfterBlockEnd();
    return body;
  }

  run(context:any, args:any, body:any, callback:any) {
    return this._run(context, args, trimBody(body));
  }
}

class Tag {
  public env: Environment;

  constructor() {
    this.env = new Environment(null, {
      autoescape: false
    });
  }

  register(name: string, fn: TagFunction, ends: boolean = false): void {
    if (!name) throw new TypeError('name is required');
    if (typeof fn !== 'function') throw new TypeError('fn must be a function');

    let tag: NunjucksTag;

    if (ends) {
      tag = new NunjucksBlock(name, fn);
    } else {
      tag = new NunjucksTag(name, fn);
    }

    this.env.addExtension(name, tag);
  }

  unregister(name: string): void {
    if (!name) throw new TypeError('name is required');

    const { env } = this;

    if (env.hasExtension(name)) env.removeExtension(name);
  }
}

export default Tag;