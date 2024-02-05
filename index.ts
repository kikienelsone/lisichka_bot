import {Bot, Context, InputFile, session, type SessionFlavor} from "grammy";
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

bot.use(session({initial}))
bot.command("start", async (ctx) => {
    await ctx.reply("Привет! Я Бот Лисичка, я могу создать тебе любую картинку или просто поболтать с тобой 🧡")
});
bot.hears(/@lisichka_craba_bot/gi,  async (ctx) => {
    const userRequest = ctx.message?.text?.split("@lisichka_craba_bot")[1]
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

bot.on("message:media", async (ctx) => {
    await ctx.react("😍")
})
bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id
    const userRequest = ctx.message?.text
    const thunk = /спасибо/gi
    const hello = /привет/gi
    console.log(userId, userRequest)
    if (userRequest?.match(hello)){
        await ctx.reply(`Привет ${getUsersId(userId)}👋`, {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
    }
    if (userRequest?.match(thunk)){
        await ctx.react("👍")
    }

})

await bot.api.sendMessage(496131654, "какашка")

// bot.use(scenes)
void bot.start()