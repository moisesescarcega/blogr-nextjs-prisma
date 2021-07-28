import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Layout from '../../components/Layout';
import Router from 'next/router';
import { PostProps } from '../../components/Post';
import { useSession } from 'next-auth/client';
import prisma from '../../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(params?.id) || -1,
    },
    include: {
      author: {
        select: {name: true, email: true},
      },
    },
  });
  return {
    props: post,
  };
};

async function publishPost(id: number): Promise<void> {
  await fetch(`/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push('/');
}

// async function updatePost(id: number): Promise<void> {
//   await fetch(`/api/update/${id}`, {
//     method: "PUT",
//   });
//   await Router.push('/');
// }

async function deletePost(id: number): Promise<void> {
  await fetch(`/api/post/${id}`, {
    method: "DELETE",
  });
  await Router.push('/');
}

const Post: React.FC<PostProps> = (props) => {
  const [ptitle, setPtitle] = useState(props.title);
  const [pcontent, setPcontent] = useState(props.content);
  const [session, loading] = useSession();

  const updatePost = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
        const body = { ptitle, pcontent };
        await fetch(`/api/update/${props.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        await Router.push('/');
    } catch(error) {
        console.error(error);
    }
};

  if (loading) {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  let title = props.title;
  // if (!props.published) {
  //   title = `${title} (Draft)`;
  // }

  return (
    <Layout>
      <div>
        <h2>{title}</h2>
        <p>By {props?.author?.name || 'Unknown author'}</p>
        <div className="post-content">
          {props.content}
        </div>
        {!props.published && userHasValidSession && postBelongsToUser && (
          <button onClick={() => publishPost(props.id)}>Publish</button>
        )}
        {userHasValidSession && postBelongsToUser && (
          <button onClick={() => deletePost(props.id)}>Delete</button>
        )}
      </div>
      <hr />
      <div>
          <form onSubmit={updatePost}>
              <input
                  autoFocus
                  onChange={(e) => setPtitle(e.target.value)}
                  placeholder="Title"
                  type="text"
                  value={props.title}
              />
              <textarea
                  cols={50}
                  onChange={(e) => setPcontent(e.target.value)}
                  placeholder="Content"
                  rows={8}
                  value={props.content + 'uno'}
              />
              <input type="submit" value="Update" />
              <a className="back" href="#" onClick={() => Router.push('/')}>
                  or Cancel
              </a>
          </form>
      </div>

      <style jsx>{`
        .post-content {
          margin-bottom: 2rem;
        }
        .page {
          background: white;
          padding: 2rem;
        }

        .actions {
          margin-top: 2rem;
        }

        button {
          background: #ececec;
          border: 0;
          border-radius: 0.125rem;
          padding: 1rem 2rem;
        }

        button + button {
          margin-left: 1rem;
        }
      `}</style>
    </Layout>
  );
};

export default Post
