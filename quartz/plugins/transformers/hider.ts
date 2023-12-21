import { QuartzTransformerPlugin } from "../types"

const regex = new RegExp(/{% hide %}([\s\S]*?){% endhide %}/, "g");
export const Hider: QuartzTransformerPlugin<{}> = (
  _,
) => {
  return {
    name: "Hider",
    textTransform(ctx, src) {

      const output = ctx.argv.verbose
        ? src.toString().replace(regex, (_, content) => {
          console.log(`removed content: ${content}`);
          return '';
        })
        : src.toString().replace(regex, '');

      return output;
    },
  }
}
