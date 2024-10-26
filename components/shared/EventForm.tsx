"use client"

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { eventFormSchema } from '@/lib/validator'
import { eventDefaultValues } from '@/constants'
import Dropdown from './Dropdown'
import { Textarea } from '../ui/textarea'
import {FileUploader} from './FileUploader'
import Image from 'next/image'
import DatePicker from "react-datepicker"
import { useUploadThing } from '@/lib/uploadthing'
import "react-datepicker/dist/react-datepicker.css";
import { Checkbox } from '../ui/checkbox'
import { useRouter } from 'next/navigation'
import { createEvent, updateEvent } from '@/lib/actions/event.actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { IEvent } from '@/lib/database/models/event.model'


type EventFormProps = {
    userId: string,
    type: 'Create' | 'Update',
    isDisabled?: boolean,
    event?: IEvent,
    eventId?: string
}

const EventForm = ({userId, type, isDisabled, event, eventId}: EventFormProps) => {
    const [files, setFiles] = useState<File[]>([])
    console.log(event)
    const initialValues = event && type === 'Update' ? {
        ...event,
        categoryId: event.category ? event.category._id : '',
        imgUrl: event.imageUrl || '',
        startDateTime: new Date(event.startDateTime),
        endDateTime: new Date(event.endDateTime)
    } : eventDefaultValues
    const [startDate, setStartDate] = useState(new Date());
    const router = useRouter()

    const {startUpload} = useUploadThing('imageUploader')
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: initialValues,
        disabled: isDisabled
      })
     
      // 2. Define a submit handler.
      async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        let uploadedImageUrl = values.imgUrl

        if(files.length > 0){
            const uploadedImages = await startUpload(files)

            if(!uploadedImages){ 
                return;
            }
            uploadedImageUrl = uploadedImages[0].url
        }
        if(type === 'Create'){
            try {
                const newEvent = await createEvent({
                    event: {...values, imageUrl: uploadedImageUrl},
                    userId,
                    path: '/profile'
                })

                if(newEvent){
                    form.reset();
                    router.push(`/events/${newEvent._id}`)
                }
            } catch (error) {
                
            }
        }
        if(type === 'Update'){
            if(!eventId){
                router.back();
                return;
            }
            try {
                const updatedEvent = await updateEvent({
                    userId,
                    event: {...values, imageUrl: uploadedImageUrl, _id: eventId},
                    path: `/events/${eventId}`
                })

                if(updatedEvent){
                    form.reset();
                    router.push(`/events/${updatedEvent._id}`)
                }
            } catch (error) {
                
            }
        }
      }

  return (
   

    <Form {...form} >
        {isDisabled && (
            <Alert className="text-red-600 border-red-500 flex flex-col justify-center align-center text-center">
                <AlertTitle>Sorry!</AlertTitle>
                <AlertDescription className='text-red-600'>
                    You can't create an Event since you're not an Admin
                </AlertDescription>
            </Alert>
        
        )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 md:flex-row">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <Input placeholder="Event Title" {...field} className='input-field'/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <Dropdown onChangeHandler={field.onChange} value={field.value}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl className='h-72'>
                    <Textarea placeholder="Description (must be less than 400 characters) " {...field} className='textarea rounded-xl'/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="imgUrl"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl className='h-72'>
                    <FileUploader onFieldChange={field.onChange} imageUrl={field.value} setFiles={setFiles} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                        <Image 
                        src="/assets/icons/location-grey.svg" 
                        alt='location'
                        width={24}
                        height={24}/>
                    <Input placeholder="Event location or Online" {...field} className='input-field'/>
                    </div>
                   
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                        <Image 
                        src="/assets/icons/calendar.svg" 
                        alt='calendar'
                        width={24}
                        height={24}
                        className='filter-grey'/>
                        <p className='ml-3 whitespace-nowrap text-grey-600'>Start Date:</p>
                        <DatePicker 
                        selected={field.value} 
                        onChange={(date) => field.onChange(date)} 
                        showTimeSelect
                        timeInputLabel='Time:'
                        dateFormat="MM/dd/YY h:mm aa"
                        wrapperClassName='datePicker'/>

                    </div>
                   
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        
   
        <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                        <Image 
                        src="/assets/icons/calendar.svg" 
                        alt='calendar'
                        width={24}
                        height={24}
                        className='filter-grey'/>
                        <p className='ml-3 whitespace-nowrap text-grey-600'>End Date:</p>
                        <DatePicker 
                        selected={field.value} 
                        onChange={(date) => field.onChange(date)} 
                        showTimeSelect
                        timeInputLabel='Time:'
                        dateFormat="MM/dd/YY h:mm aa"
                        wrapperClassName='datePicker'/>

                    </div>
                   
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
        <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                        <Image 
                        src="/assets/icons/dollar.svg" 
                        alt='dollar'
                        width={24}
                        height={24}
                        className='filter-grey'/>
                      
                        <Input type='number' placeholder='Price' {...field} className='p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:boder-0 focus-visible:ring-0 focus-visible:ring-offset-0'/>
                        <FormField
                            control={form.control}
                            name="isFree"
                            render={({ field }) => (
                                <FormItem >
                                <FormControl>
                                    <div className="flex items-center">
                                        <label htmlFor='isFree' className='whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Free Ticket</label>
                                        <Checkbox id='isFree' className='mr-2 h-5 w-5 border-2 border-primary-500' onCheckedChange={field.onChange} checked={field.value}/>
                                    </div>
                                
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                    </div>
                   
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
                <FormItem className='w-full'>
                <FormControl>
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                        <Image 
                        src="/assets/icons/link.svg" 
                        alt='location'
                        width={24}
                        height={24}/>
                    <Input placeholder="URL" {...field} className='input-field'/>
                    </div>
                   
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <Button type="submit"
        size="lg"
        disabled={form.formState.isSubmitting || isDisabled}
        className='button col-span-2 w-full'>{form.formState.isSubmitting ? 'Submitting...' : `${type} Event `}</Button>
      </form>
    </Form>
  )
}

export default EventForm