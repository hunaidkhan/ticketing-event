import EventForm from '@/components/shared/EventForm';
import { auth, currentUser } from '@clerk/nextjs';
import React from 'react'

 const CreateEvent = async () => {
    const {sessionClaims} = auth();
    const userId = sessionClaims?.userId as string;
    
    const user = await currentUser()
    let isDisabled = false
    if(user?.emailAddresses[0].emailAddress !== process.env.ADMIN_USER) {
      isDisabled = true;
    }
  return (
    <>
        <section className='bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10'>
            <h3 className='wrapper h3-bold text-center sm:text-left'>Create Event</h3>
        </section>

        <div className="wrapper my-8">
            <EventForm userId={userId} type='Create' isDisabled={isDisabled} />
        </div>
    </>
  )
}

export default CreateEvent