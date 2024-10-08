import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType }) => {

    const getPostsEndPoint = () => {
        switch (feedType) {
            case 'forYou':
                return '/api/post/all';
            case 'following':
                return '/api/post/following';
            default:
                return '/api/post/all';
        }
    }

    const PostEndPoint = getPostsEndPoint();

    console.log(PostEndPoint);
    


    const { data:posts, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['posts'],
        queryFn: async () => {
            try {
                const res = await fetch(PostEndPoint);
                const data = await res.json();
                if(data.error) return null;
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data.posts;
            } catch (error) {
                console.log(error.message);
            }
        }
    })
console.log(posts);

    useEffect(()=>{
        refetch();
    },[feedType,refetch])

    return (
        <>
            {(isLoading || isRefetching) && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {!isLoading && !isRefetching && posts?.length === 0 && (<p className='text-center my-4'>No posts in this tab. Switch 👻</p>)}
            {!isLoading && !isRefetching && posts && (
                <div>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>
            )}
        </>
    );
};
export default Posts;