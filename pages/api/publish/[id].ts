import prisma from "../../../lib/prisma";

export default async function handle(req,res) {
    const postId = req.query.id;
    const post = await prisma.post.update({
        where: { id: Number(postId) },
        data: { published: true },
    });
    res.json(post);
}