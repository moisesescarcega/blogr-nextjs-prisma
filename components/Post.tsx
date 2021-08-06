import React from "react";
import Router from "next/router";
import { useSession } from "next-auth/client";

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const [session] = useSession();
  const verificaSesion = () => {
    if (session) {
      Router.push("/p/[id]", `/p/${post.id}`);
    }
  };
  const authorName = post.author ? post.author.name : "Unknown author";
  return (
    <div onClick={verificaSesion}>
      <h2>{post.title}</h2>
      <small>By {authorName}</small>
      <div>{post.content}</div>
      <style jsx>{`
        div {
          color: inherit;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Post;
