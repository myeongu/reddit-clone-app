import React from 'react'
import { Post } from '../types'
import {FaArrowUp, FaArrowDown} from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useAuthState } from '../context/auth';
import axios from 'axios';

interface PostCardProps {
    post: Post
    subMutate: () => void
}

const PostCard = ({
    post: {
    identifier, slug, title, body, subName, createdAt, voteScore, userVote, commentCount, url, username, sub,
    },
    subMutate
}: PostCardProps) => {
    const router = useRouter();
    const { authenticated } = useAuthState();
    const isInSubPage = router.pathname === '/r/[sub]'
    
    const vote = async (value: number) => {
        if (!authenticated) router.push('/login');

        if (value === userVote) value = 0;

        try {
            await axios.post('/votes', {
                identifier,
                slug,
                value
            })
            if (subMutate) { subMutate(); }
        } catch (error) {
            console.log(error);
        }
    }


  return (
    <div
        className="flex mb-4 bg-white rounded"
        id={identifier}
    >
        {/* Vote section */}
        <div className='flex-shrink-0 w-10 py-2 text-center rounded-l'>
            {/* Upvote */}
            <div
                className='flex justify-center w-6 mx-auto text-gray-400 roudned cursor-pointer hover:bg-gray-300 hover:text-red-500'
                onClick={() => vote(1)}
            >
                {userVote === 1?
                    <FaArrowUp className='text-red-500'/>
                    : <FaArrowUp />
                }
            </div>
            <p className='text-xs font-bold'>{voteScore}</p>
            {/* Downvote */}
            <div
                className='flex justify-center w-6 mx-auto text-gray-400 roudned cursor-pointer hover:bg-gray-300 hover:text-blue-600'
                onClick={() => vote(-1)}
            >
                {userVote === -1?
                    <FaArrowDown className='text-blue-600'/>
                    : <FaArrowDown />
                }
            </div>
        </div>
        {/* post data */}
        <div className='w-full p-2'>
                {!isInSubPage && (
                    <div className='flex items-center'>
                        <Link href={`/r/${subName}`}>
                            <Image
                                src={sub!.imageUrl}
                                className="w-6 h-6 mr-1 rounded-full cursor-pointer"
                                alt="sub"
                            />
                        </Link>
                        <Link
                            href={`/r/${subName}`}
                            className="text-xs font-bold cursor-pointer hover:underline"
                        >
                            /r/{subName}
                        </Link>
                        <span className='mx-1 text-xs text-gray-500'></span>
                    </div>
                )}
            <p className='text-xs text-gray-500'>
                Posted by
                <Link href={`/u/${username}`}>
                    <span className='mx-1 hover:underline'>/u/{username}</span>
                </Link>
                <Link href={url}>
                    <span className='mx-1 hover:underline'>
                        {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
                    </span>
                </Link>
            </p>
            <Link 
                href={url}
                className="my-1 text-lg font-medium">
                    {title}
            </Link>
            {body && <p className='my-1 text-sm'>{body}</p>}
            <div className='flex'>
                <Link href={url}>
                    <div>
                        <i className='mr-1 fas fa-comment-alt fa-xs'></i>
                        <span>{commentCount}</span>
                    </div>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default PostCard