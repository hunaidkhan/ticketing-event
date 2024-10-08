import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventById, getEventsByUser } from '@/lib/actions/event.actions'
import { auth, currentUser } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'


const ProfilePage = async () => {
    const {sessionClaims} = auth();
    const userId = sessionClaims?.userId as string;
    const user = await currentUser();
    let isAdmin = true;
    if(user?.emailAddresses[0].emailAddress !== process.env.ADMIN_USER) {
        isAdmin = false;
      }

    const organizedEvents = await getEventsByUser({ userId, page: 1})
  return (
    <>
        {/* My tickets */}
        <section className="bg-primary-50 bg-dotted-patter bg-cover bg-center py-5 md:py-10">
            <div className="wrapper flex items-center justfiy-center sm:justify-between">
                <h3 className="h3-bold text-center sm:text-left">My Tickets</h3>
                <Button asChild size="lg" className='button hidden sm:flex'>
                    <Link href={"/#events"}>Explore more Events</Link>

                </Button>
            </div>
        </section>

       {/* <section className="wrapper my-8">
            <Collection 
            data={events?.data}
            emptyTitle="No event tickets purchased yet"
            emptyStateSubtext="No worries - Say Alhamdulillah!!!"
            collectionType="My_Tickets"
            limit={3}
            page={1}
            urlParamName='ordersPage'
            totalPages={2}
            />
        </section> */} 
        {/* Events organized */}
        {isAdmin && (
            <>
                <section className="bg-primary-50 bg-dotted-patter bg-cover bg-center py-5 md:py-10">
                    <div className="wrapper flex items-center justfiy-center sm:justify-between">
                        <h3 className="h3-bold text-center sm:text-left">Events Organized</h3>
                        <Button asChild size="lg" className='button hidden sm:flex'>
                            <Link href={"/events/create"}>Create New Event</Link>

                        </Button>
                    </div>
                </section>
                <section className="wrapper my-8">
                    <Collection 
                    data={organizedEvents?.data}
                    emptyTitle="No events have been created"
                    emptyStateSubtext="Maybe you don't have access to event creation. Say Alhamdulillah"
                    collectionType="Events_Organized"
                    limit={6}
                    page={1}
                    urlParamName='eventsPage'
                    totalPages={2}
                    />
                </section> 
        </> 
    )}
    </>
  )
}

export default ProfilePage