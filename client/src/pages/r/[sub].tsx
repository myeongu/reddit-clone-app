import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Image from 'next/image';
import { useAuthState } from '@/src/context/auth';

function SubPage() {
    const [ownSub, setOwnSub] = useState(false);
    const { authenticated, user } = useAuthState();

    const fetcher = async (url:string) => {
        try {
            const res = await axios.get(url);
            return res.data;
        } catch (error: any) {
            throw error.response.data;
        }
    }

    const router = useRouter();
    const subName = router.query.sub;
    const { data: sub, error } = useSWR(subName ? `/subs/${subName}` : null, fetcher);

    useEffect(() => {
      if (!sub || !user) return;
      setOwnSub(authenticated && user.username === sub.username);
    }, [sub])

    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadImage = async (event: ChangeEvent) => {
        if (event.target.files === null) return;
        const file = event.target.files[0];
        console.log("file!!", file)

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileInputRef.current!.name);

        try {
            await axios.post(`/subs/${sub.name}/upload`, formData, {
                headers: {"Context-Type": "multipart/form-data"},
            });
        } catch (error) {
            console.log(error);
        }
    }

    const openFileInput = (type: string) => {
        
        const fileInput = fileInputRef.current;
        if (fileInput) {
            fileInput.name = type;
            fileInput.click();
        }
    }
  return (
    <>
        {sub && (
            <>
                <input 
                    type="file" 
                    hidden={true} 
                    ref={fileInputRef} 
                    onChange={uploadImage}
                />
                {/* Banner image */}
                <div className='bg-gray-400'>
                    {sub.bannerUrl ? (
                        <div
                            className='h-56'
                            style={{
                                backgroundImage: `url(${sub.bannerUrl})`,
                                backgroundRepeat: "no-repeat",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                            onClick={() => openFileInput("banner")}
                            ></div>
                    ) : (
                        <div 
                            className='h-20 bg-gray-400'
                            onClick={() => openFileInput("banner")}
                        ></div>
                    )}
                </div>
                
                {/* Sub meta data */}
                <div className='h-20 bg-white'>
                    <div className='relative flex max-w-5xl px-5 mx-auto'>
                        <div className='absolute' style={{ top: -15 }}>
                            {sub.imageUrl && (
                                <Image
                                    src={sub.imageUrl}
                                    alt=""
                                    width={70}
                                    height={70}
                                    className="rounded-full"
                                    onClick={() => openFileInput("image")}
                                />
                            )}
                        </div>
                        <div className='pt-1 pl-24'>
                            <div className='flex items-center'>
                                <h1 className='text-3xl font-bold'>
                                    {sub.title}
                                </h1>
                            </div>
                            <p className='text-sm font-bold text-gray-400'>
                                /r/{sub.name}
                            </p>
                        </div>
                    </div>
                </div>
                {/* posts & sidebar */}
                <div className='flex max-w-5xl px-4 pt-5 mx-auto'>

                </div>
            </>
        )}
    </>
  )
}

export default SubPage