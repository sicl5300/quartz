import Tag from "../tags";
import { QuartzTransformerPlugin } from "../types"
import nunjucks, { Environment, Extension } from "nunjucks";

export interface Options {

}

const nunjucksCfg = {
  autoescape: false,
  throwOnUndefined: false,
  trimBlocks: false,
  lstripBlocks: false
};

// class HelloWorldExtension implements Extension {
//   public tags: any[] = ['helloworld'];

//   public parse(parser: any, nodes: any): any {
//     const token: any = parser.nextToken();
//     const args: any = parser.parseSignature(true);

//     parser.advanceAfterBlockEnd(token.value);
//     return new nodes.CallExtension(this, 'run', args);
//   }

//   public run(context: any): string {
//     return 'helloworlds';
//   }
// }

const tags = new Tag();

tags.register("helloworld", ()=>{
  return 'helloworld parsed.';
})
tags.register("blocked", (args, con)=>{
  return `parsed blocked, args [${args[0]}]: \n${con}`;
}, true)
tags.register('hide', () => '', true);


const env = tags.env;

export const Nunjucks: QuartzTransformerPlugin<Partial<Options> | undefined> = (userOpts) => {
  //const opts = { ...userOpts }
  return {
    name: "Nunjucks",
    textTransform(ctx, src) {
      return nunjucks
        .compile(src.toString(), env)
        .render();
    },
  }
}