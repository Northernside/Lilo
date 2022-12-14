import {client} from "@core/redis";
import Express, {Request, Response} from "express";
import Cookies from "cookie-parser";
import FS from "node:fs";

export const app = Express();

import {server} from "./routes/server";
import {stats} from "./routes/stats";
import {blog} from "./routes/blog";
import {postBlog} from "./routes/postblog";
import {discordCallback} from "./routes/discordCallback";
import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

const createBlogHTML = FS.readFileSync(`${__dirname}/static/blog/create.html`, "utf-8");

app.use(Express.static(`${__dirname}/static`));
app.use(Cookies());

app.get("/server/:address", async function (req: Request, res: Response) {
    await server(req, res);
});

app.get("/server/:address/stats", async function (req: Request, res: Response) {
    await stats(req, res);
});

app.get("/blog/create", async function (req: Request, res: Response) {
    if (!await isLoggedIn(req))
        return res.send({"status": 401});

    return res.send(createBlogHTML);
});

app.post("/blog/post", Express.json(), async function (req: Request, res: Response) {
    if (!await isLoggedIn(req))
        return res.send({"status": 401});

    await postBlog(req, res);
});

app.get("/blog/:id", async function (req: Request, res: Response) {
    await blog(req, res);
});

app.get("/auth/login", async function (req: Request, res: Response) {
    return res.redirect(process.env.DISCORD_OAUTH_URL);
});

app.get("/auth/discordCallback", async function (req: Request, res: Response) {
    await discordCallback(req, res);
});

app.get("/logout", async function (req: Request, res: Response) {
    if (!req.cookies.id || !req.cookies.access_token)
        return res.send({"status": 401});

    if (!await client.exists(`discord:${req.cookies.id}`))
        return res.end({"status": 404});

    res.cookie("id", "", {maxAge: 0});
    res.cookie("access_token", "", {maxAge: 0});
    res.redirect("/");
});

export async function isLoggedIn(req) {
    if (!req.cookies.id || !req.cookies.access_token)
        return false;

    const id = req.cookies.id,
        access_token = req.cookies.access_token;

    const accessTokens = JSON.parse(await client.hGet(`discord:${id}`, "access_tokens") || "[]");
    return accessTokens.some(token => token.accessToken == access_token);
}