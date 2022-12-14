import {Request, Response} from "express";
import {client} from "@core/redis";
import FS from "node:fs";

export const blog = async (req: Request, res: Response) => {
    const id = req.params.id;
    const blog = JSON.parse(await client.get(`blog:${id}`));

    if (!blog)
        return res.send({"status": 404});

    let blogHTML = FS.readFileSync(`${__dirname}/../static/blog/index.html`, "utf-8");
    blogHTML = blogHTML.replace(/{pretty_name}/g, blog.pretty_name);
    blogHTML = blogHTML.replace(/{affected_servers}/g, blog.affected_servers);
    blogHTML = blogHTML.replace(/{downtime_text}/g, blog.downtime_text);
    res.send(blogHTML);
}