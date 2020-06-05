import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./routes";


const app = new Koa();
const PORT = process.env.PORT || '8000';

app
  .use(bodyParser({ jsonLimit: '7mb' }))
  .use(async (ctx, next) => {
    //Change for better authentication soon
    // if (ctx.request.body.blinkerSecret !== process.env.BLINKER_SECRET) {
    //   ctx.status = 401;
    //   return;
    // }
    await next();
  })
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(PORT);
console.log(`Listening on ${PORT}`);
