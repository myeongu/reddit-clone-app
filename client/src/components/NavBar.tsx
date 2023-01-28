import Link from 'next/link'
import React from 'react'
import { useAuthDispatch, useAuthState } from '../context/auth'
import axios from 'axios';
import Image from 'next/image';
import { FaSearch } from "react-icons/fa";

function NavBar() {
  const {authenticated, loading} = useAuthState();

  const dispatch = useAuthDispatch();

  const handleLogout = () => {
    axios.post("/auth/logout")
      .then(() => {
        dispatch("LOGOUT");
        window.location.reload();
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  return (
    <div className='fixed inset-x-0 top-0 z-10 flex items-center justify-between h-13 px-5 bg-white'>

      <span className='text-2xl font-semibold text-gray-400'>
        <Link href="/">
          <Image
            src="/insignia.png"
            alt="logo"
            width={40}
            height={50}
          />
        </Link>
      </span>

      <div className='max-w-full px-4'>
        <div className='relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white'>
          <FaSearch className='ml-2 text-gray-400' />
          <input 
            type="text"
            placeholder='Search'
            className='px-3 py-1 bg-transparent rounded focus:outline-none h-7'
          />
        </div>
      </div>

      <div className='flex'>
        {!loading &&
          (authenticated ? (
            <button
              className='w-20 px-2 text-sm h-7 mr-2 text-center text-white bg-gray-400 rounded'
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link 
                href="/login" 
                className='w-20 px-2 pt-1 text-sm h-7 mr-2 text-center text-blue-500 border-blue-500 rounded'
              >
                Log in
              </Link>
              <Link href='/register'
                className='w-20 px-2 pt-1 text-sm h-7 text-center text-white bg-gray-400 rounded'>
                  Sign up
              </Link>
            </>
          ))}
      </div>
      
    </div>
  )
}

export default NavBar