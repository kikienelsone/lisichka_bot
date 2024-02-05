import {Bot, Context, GrammyError, HttpError, InputFile, session, type SessionFlavor} from "grammy";
import type {ScenesFlavor, ScenesSessionData} from "grammy-scenes";
import {generate, getToken, picGeneration} from "./Requests.ts";
import {getUsersId} from "./UsersId.ts";

type SessionData = ScenesSessionData & {

}

export type BotContext = Context & SessionFlavor<SessionData> & ScenesFlavor

const bot = new Bot<BotContext>(process.env.TOKEN)

export function initial(): SessionData {
    return {

    };
}

// const getMe = await bot.api.getMe()

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

bot.use(session({initial}))
bot.command("start", async (ctx) => {
    await ctx.reply("Привет! Я Бот Лисичка, я могу создать тебе любую картинку или просто поболтать с тобой 🧡")
});
bot.hears(new RegExp(process.env.BOTNAME, "gi"),  async (ctx) => {
    // console.log(`@${getMe.username}`)
    const userRequest = ctx.message?.text?.split(process.env.BOTNAME)[1]
   await ctx.reply("Иду искать картинку👀", {
        reply_parameters: {message_id: ctx.msg.message_id}
    })
    getToken().then((token) => {
        generate({
            prompt: userRequest ?? "",
            modelId: token
        }).then((uuid) => {
            picGeneration(uuid).then(async (picture) => {
                const pic = picture?.replace(/^data:image\/w+;base64,/, '') ?? ""
                const file = Buffer.from(pic, 'base64')
               await ctx.replyWithPhoto(new InputFile(file))
        })
        })
    })

})

// bot.on("message").filter(
//     async (ctx) => {
//         console.log("first on")
//         const user = await ctx.getAuthor();
//         // console.log(user)
//         return ctx.message.text === "creator";
//     },
//     async (ctx) => {
//        await ctx.reply("yt pyf.")
//     },
// );

bot.on("message:media", async (ctx) => {
    await ctx.react("😍")
})
bot.on("message:text", async (ctx) => {
    const user = await ctx.getAuthor();
    const userRequest = ctx.message?.text
    const thunk = /спасибо/gi
    const hello = /привет/gi
    console.log(user, userRequest)
    if (userRequest?.match(hello)){
        await ctx.reply(`Привет ${getUsersId(user.user?.id)}👋`, {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
    }
    if (userRequest?.match(thunk)){
        await ctx.react("👍")
    }

})

await bot.api.sendMessage(496131654, "Люблю краба")

// bot.use(scenes)
void bot.start()