import prisma from "../../../lib/prisma";

// export default async function handle(req, res) {
//     const {title, content} = req.body;
    
//     const session = await getSession({req});
//     const result = await prisma.post.create({
//         data: {
//             title: title,
//             content: content,
//             author: { connect: { email: session?.user?.email } },
//         },
//     });
//     res.json(result);
// }

export default async function handle(req,res) {
    const {ptitle, pcontent} = req.body;
    const postId = req.query.id;
    const update = await prisma.post.update({
        where: { id: Number(postId) },
        data: { 
            title: ptitle,
            content: pcontent,
        },
    });
    res.json(update);
}