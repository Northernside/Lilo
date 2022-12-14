import {Request, Response} from "express";
import {client} from "@core/redis";
import FS from "node:fs";

export const blog = async (req: Request, res: Response) => {
    const id = req.params.id;
    const blog = JSON.parse(await client.get(`blog:${id}`));

    if (!blog)
        return res.status(404).send({"status": 404});

    let blogHTML = FS.readFileSync(`${__dirname}/../static/blog/index.html`, "utf-8");
    blogHTML = blogHTML.replace(/{title}/g, blog.title);
    blogHTML = blogHTML.replace(/{message}/g, blog.message);
    return res.send(blogHTML);
}