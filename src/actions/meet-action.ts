'use server';

import { revalidatePath } from 'next/cache';
import { google } from 'googleapis';
import { calendar_v3 as googleCalendar } from '@googleapis/calendar';
import { parse, add, format, parseISO } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

// 1) Scopes + Calendar ID
const SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/calendar.events',
];
const calendarId = process.env.CALENDAR_ID!;

// 2) Initialize the Google Calendar client
const initGoogleCalendar = async () => {
	const auth = new google.auth.GoogleAuth({
		credentials: {
			client_id: process.env.GOOGLE_CLIENT_ID,
			client_email: process.env.GOOGLE_CLIENT_EMAIL,
			project_id: process.env.GOOGLE_PROJECT_ID,
			private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
		},
		scopes: SCOPES,
	});
	return google.calendar({ version: 'v3', auth });
};

// 3) Your IST slots, unchanged
const availableSlots = [
	'12:00',
	'12:30',
	'13:00',
	'13:30',
	'14:00',
	'14:30',
	'15:00',
	'15:30',
	'16:00',
	'16:30',
	'17:00',
	'17:30',
	'18:00',
	'18:30',
	'19:00',
	'19:30',
];

/**
 * Turn each "HH:mm IST" slot into the correct UTC Date for conflict checks.
 */
export const buildDateSlots = async (date: Date): Promise<Date[]> => {
	const isoDay = format(date, 'yyyy-MM-dd'); // e.g. "2025-05-12"
	return availableSlots.map((slot) =>
		// fromZonedTime assumes the string is in Asia/Kolkata
		fromZonedTime(`${isoDay}T${slot}:00`, 'Asia/Kolkata')
	);
};

/**
 * Fetch busy events for the given IST day and return the free slots (as "HH:mm").
 * @param date  in 'yyyyMMdd' format, e.g. "20250512"
 */
export const getAvailableSlots = async (date: string): Promise<string[]> => {
	const calendar = await initGoogleCalendar();

	// Build the UTC range that corresponds to the IST calendar day
	const isoDay = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(
		6,
		8
	)}`; // "2025-05-12"
	const dayStartUtc = fromZonedTime(`${isoDay}T00:00:00`, 'Asia/Kolkata');
	const dayEndUtc = add(dayStartUtc, { days: 1 });

	const resp = await calendar.events.list({
		calendarId,
		singleEvents: true,
		orderBy: 'startTime',
		timeMin: dayStartUtc.toISOString(),
		timeMax: dayEndUtc.toISOString(),
	});
	const events = resp.data.items || [];

	// Compute all 30-min slot start times (in UTC)
	const dayDate = parse(date, 'yyyyMMdd', new Date());
	const allSlotsUtc = await buildDateSlots(dayDate);

	// Filter out slots that overlap existing events
	const freeSlotsUtc = allSlotsUtc.filter((slotUtc) => {
		const slotEndUtc = add(slotUtc, { minutes: 30 });
		return !events.some((evt: googleCalendar.Schema$Event) => {
			const evtStart = new Date(evt.start?.dateTime || '');
			const evtEnd = new Date(evt.end?.dateTime || '');
			return slotUtc < evtEnd && slotEndUtc > evtStart;
		});
	});

	// Convert each free UTC slot back into IST for display
	return freeSlotsUtc.map((slotUtc) => {
		const slotIst = toZonedTime(slotUtc, 'Asia/Kolkata');
		return format(slotIst, 'HH:mm');
	});
};

/**
 * Create the event at the picked IST time by handing Google a local ISO string + timeZone.
 * @param prevState  unused
 * @param formData   must include:
 *   - selectedCalendarDate: 'yyyy-MM-dd'
 *   - timetable:            'HH:mm'
 *   - email, message, etc.
 */
export const createMeeting = async (
	_prevState: { message: string } | null,
	formData: FormData
): Promise<{ message: string }> => {
	const calendar = await initGoogleCalendar();
	const dateString = formData.get('selectedCalendarDate') as string; // now '2025-05-12'
	const timeString = formData.get('timetable') as string; // e.g. '12:30'
	const description = formData.get('message') as string;
	const invitee = formData.get('email') as string;

	if (!dateString || !timeString) {
		return { message: 'Please select a date and time slot' };
	}

	// Build local‐IST ISO timestamps
	const startDateTimeStr = `${dateString}T${timeString}:00`; // '2025-05-12T12:30:00'
	const endDate = add(parseISO(startDateTimeStr), { minutes: 30 });
	const endTime = format(endDate, 'HH:mm');
	const endDateTimeStr = `${dateString}T${endTime}:00`; // '2025-05-12T13:00:00'

	// Let Google schedule it in IST
	const event: googleCalendar.Schema$Event = {
		summary: `Call with ${invitee}`,
		description: description || undefined,
		start: {
			dateTime: startDateTimeStr,
			timeZone: 'Asia/Kolkata',
		},
		end: {
			dateTime: endDateTimeStr,
			timeZone: 'Asia/Kolkata',
		},
		conferenceData: {
			createRequest: {
				requestId: Math.random().toString(36).slice(-8),
				conferenceSolutionKey: { type: 'hangoutsMeet' },
			},
		},
		reminders: {
			useDefault: false,
			overrides: [{ method: 'email', minutes: 30 }],
		},
	};

	const resp = await calendar.events.insert({
		calendarId,
		requestBody: event,
	});
	// debug
	console.log('Insert response:', resp.status, resp.data);

	const message =
		resp.status === 200
			? 'Meeting has been added to my calendar'
			: `Failed to insert event (${resp.status})`;

	revalidatePath('/');
	return { message };
};
