import {Request, Response} from "express";
import Crypto from "crypto";
import {client} from "@core/redis";

export const postBlog = async (req: Request, res: Response) => {
    const id = Crypto.randomBytes(8).toString("hex").slice(0, 8);
    await client.set(`blog:${id}`, JSON.stringify({
        "title": req.body.title,
        "message": req.body.message
    }));

    return res.send({"status": 200, "id": id});
}