import { GoogleOneTap, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import {motion} from "framer-motion"
import NavItems from './NavItems'
import MobileNav from './MobileNav'

const Header = () => {
  return (
    <header className='w-full border-b'>
        <div className="wrapper flex items-center justify-between">
            <Link href='/' className='w-36'>
            <Image src='/assets/images/logo.svg' width={128} height={38} alt='MSA'/>
            </Link>

            <nav className='md:flex-between hidden w-full max-w-xs'>
              <NavItems />
            </nav>
            <div className='flex w-32 justify-end gap-3'>
                <SignedIn>
                    <UserButton afterSignOutUrl='/' />
                </SignedIn>
                <SignedOut>
                    <Button asChild className='rounded-full' size="lg"> 
                            <Link href='/sign-in'>
                            Login
                            </Link>
                    </Button>
                </SignedOut>
                <MobileNav />
        </div>
        
        </div>
        
    </header>
  )
}

export default Header