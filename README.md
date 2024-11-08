# Gmeet NextJS
[Calendly](https://calendly.com/) like and light version to create meeting against your google calendar

![image](https://github.com/user-attachments/assets/60554b35-51a1-473b-941d-a874b7b5ba22)

# Features
You define which time of the day you have the calendar open (lets say we have a 2 hours time slot each day for 20 min meeting between 8:00 to 10:00 AM CET)

User do not require to be authenticated

User can select a day, based on the date selection, the 20 min free slot for this date will be displayed.

User picks a 20 min slot, fills in his email and description and can submit form

The meeting will be created and added in your Google Calendar


# Technical Corner

The development of the page is explained in this [medium article](https://medium.com/@frederic.henri/nextjs-application-to-manage-your-google-calendar-and-your-invites-28dce1707b24)

## Stack

- The app is built with the [nextJS](https://nextjs.org/) framework
- NextJS App Router and Form Action to integrate with the back end
- The backend is your Google Calendar, you need to configure a Google Service Account and your Google Calendar (see the [article](https://medium.com/@frederic.henri/step-by-step-guide-to-create-google-service-account-f8237a02f9a4)) for a step by step guide
- The page design is mainly inspired from [Flowbite inline timepicker component](https://flowbite.com/docs/forms/timepicker/#inline-timepicker-buttons)
- Made with the help of [Tailwind css](https://tailwindcss.com/) in order to get acceptable design


## Deployment

As usual, the easiest way to deploy Next.js app is to use the the [Vercel Platform](https://vercel.com/new). Make sure to add the required environment variables to connect with your Google Calendar once deployed.

- vercel app: https://gmeet-nextjs.vercel.app
- CNAME record from the main site (hosted at cloudflare): https://gmeet.cloud06.io

