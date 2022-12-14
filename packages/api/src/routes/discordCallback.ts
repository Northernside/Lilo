import Axios from "axios";
import Crypto from "crypto";
import dotenv from "dotenv";
import process from "node:process";
import JWT from "jsonwebtoken";

import {client} from "@core/redis";

dotenv.config();

export const discordCallback = async (req: any, res: any): Promise<any> => {
    const code = req.query.code as string;

    if (!code)
        return res.status(500).json({"status": 500});

    try {
        const formData = new URLSearchParams({
            client_id: process.env.DISCORD_OAUTH_CLIENT_ID,
            client_secret: process.env.DISCORD_OAUTH_CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: `http://localhost:3000/auth/discordCallback`
        });

        const response = await Axios.post("https://discord.com/api/v8/oauth2/token", formData.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });

        const {access_token} = response.data;
        if (!response.data)
            return res.status(500).json({"status": 500});

        const userResponse = await Axios.get("https://discord.com/api/v8/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const {id} = userResponse.data,
            allowedUsers = JSON.parse(await client.get("discord:admins") || "[]");
        if (!allowedUsers.includes(id))
            return res.status(401).send({"status": 401});

        const accessTokens = JSON.parse(await client.hGet(`discord:${id}`, "access_tokens") || "[]"),
            tokenSecret = Crypto.randomBytes(8).toString("hex").slice(0, 2048),
            accessToken = await JWT.sign({user_id: id}, tokenSecret);
        accessTokens.push({"accessToken": accessToken, "tokenSecret": tokenSecret});

        await client.hSet(`discord:${id}`, "data", JSON.stringify(userResponse.data));
        await client.hSet(`discord:${id}`, "access_tokens", JSON.stringify(accessTokens));

        res.cookie("id", id, {expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});
        res.cookie("access_token", accessToken, {expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 365))});

        res.redirect(`http://localhost:3000/blog/create`);
    } catch (err) {
        console.log(err);
        return res.status(500).json({"status": 500});
    }
};