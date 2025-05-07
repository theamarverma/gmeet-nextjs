'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { createMeeting, getAvailableSlots } from '@/actions/meet-action';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';
import { toast } from 'react-toastify';

export default function AppointmentForm() {
	const [state, formMeetAction] = useActionState(createMeeting, {
		message: '',
	});
	const [selected, setSelectedDate] = useState<Date>();
	const [slots, setAvailableSlots] = useState<string[]>();
	const [timetableError, setTimetableError] = useState<string>('');
	const [isTimeTableLoading, setIsTimeTableLoading] = useState(false);
	const [showMessage, setShowMessage] = useState(false);

	const handleDayPickerSelect = async (date: Date | undefined) => {
		setTimetableError('');
		setShowMessage(false);
		if (!date) {
			setSelectedDate(undefined);
			setAvailableSlots([]);
		} else {
			if (date.getDay() == 0 || date.getDay() == 6 || date < new Date()) {
				setSelectedDate(undefined);
				setAvailableSlots([]);
			} else {
				setSelectedDate(date);
				setIsTimeTableLoading(true);
				try {
					const availableSlots = await getAvailableSlots(
						format(date, 'yyyyMMdd')
					);
					setAvailableSlots(availableSlots);
				} catch (error) {
					console.error(error);
					setTimetableError(
						'Failed to fetch available slots. Please try again.'
					);
				} finally {
					setIsTimeTableLoading(false);
				}
			}
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		if (
			!formData.get('timetable') ||
			!formData.get('selectedCalendarDate')
		) {
			setTimetableError('Please select a date and time slot');
		}
		await formMeetAction(formData);

		// Show toast notification after form submission
		toast.success('Meeting has been scheduled successfully!', {
			position: 'top-right',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		});
	};

	const resetForm = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const form = event.currentTarget.form;
		if (form) {
			form.reset();
			setSelectedDate(undefined);
		}
	};

	return (
		<div className="flex items-center justify-center p-10">
			<form
				name="meeting-invitation-form"
				className="flex flex-col gap-4"
				onSubmit={handleSubmit}>
				<h2 className="text-xl text-gray-900 dark:text-white font-bold mb-2">
					Let&apos;s Talk
				</h2>
				{showMessage && state.message && (
					<p className="text-green-500 text-md mt-2">
						{state.message}
					</p>
				)}

				<div className="flex flex-col gap-2">
					{/* New fields for name, contact, and address */}
					<input
						type="text"
						id="name"
						name="name"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Full Name"
						required
					/>

					<input
						type="text"
						id="address"
						name="address"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Address"
						required
					/>

					<input
						type="tel"
						id="contactNo"
						name="contactNo"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Contact Number"
						required
					/>

					<input
						type="email"
						id="email"
						name="email"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Email"
						required
					/>

					<input
						type="text"
						id="referredBy"
						name="referredBy"
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Referred By"
					/>
				</div>

				<div className="flex flex-col sm:flex-row gap-4">
					<DayPicker
						mode="single"
						required
						selected={selected}
						onSelect={handleDayPickerSelect}
					/>
					<input
						id="selectedCalendarDate"
						name="selectedCalendarDate"
						type="hidden"
						// ALWAYS 'yyyy-MM-dd', e.g. '2025-05-12'
						value={selected ? format(selected, 'yyyy-MM-dd') : ''}
					/>

					<div className="sm:ms-7 sm:ps-5 sm:border-s border-gray-200 dark:border-gray-800 w-full sm:max-w-[15rem] mt-5 sm:mt-0">
						<h3 className="text-gray-900 dark:text-white text-base font-medium mb-3 text-center">
							{selected
								? selected.toLocaleDateString()
								: 'Select a Date First'}
						</h3>
						<button
							type="button"
							data-collapse-toggle="timetable"
							className="inline-flex items-center w-full py-2 px-5 me-2 justify-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
							<svg
								className="w-4 h-4 text-gray-800 dark:text-white me-2"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								fill="currentColor"
								viewBox="0 0 24 24">
								<path
									fillRule="evenodd"
									d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
									clipRule="evenodd"
								/>
							</svg>
							Pick An Available Time
						</button>
						<label className="sr-only">Pick a time</label>
						{isTimeTableLoading ? (
							<div className="flex flex-col justify-center items-center h-32">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
								<p className="ml-2 justify-center items-center">
									Loading...
								</p>
							</div>
						) : (
							<>
								{slots && slots.length > 0 ? (
									<>
										<ul
											id="timetable"
											className="grid w-full grid-cols-2 gap-2 mt-5">
											{slots.map((slot) => (
												<li key={slot}>
													<input
														type="radio"
														id={slot}
														value={slot}
														className="hidden peer"
														name="timetable"
														onChange={() =>
															setTimetableError(
																''
															)
														}
													/>
													<label
														htmlFor={slot}
														className="inline-flex items-center justify-center w-full p-2 text-sm font-medium text-center bg-white border rounded-lg cursor-pointer text-blue-600 border-blue-600 dark:hover:text-white dark:border-blue-500 dark:peer-checked:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-600 hover:text-white peer-checked:text-white hover:bg-blue-500 dark:text-blue-500 dark:bg-gray-900 dark:hover:bg-blue-600 dark:hover:border-blue-600 dark:peer-checked:bg-blue-500">
														{slot} PM IST
													</label>
												</li>
											))}
										</ul>
										{timetableError && (
											<p className="text-red-500 items-center text-sm mt-2">
												{timetableError}
											</p>
										)}
									</>
								) : (
									<div className="flex justify-center items-center h-32 w-full">
										<p className="text-lg font-medium dark:text-white">
											No Time Available
										</p>
									</div>
								)}
							</>
						)}
					</div>
				</div>
				<div className="flex flex-col gap-2">
					<textarea
						id="message"
						name="message"
						required
						rows={4}
						className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Please Provide Topics For the Discussion..."></textarea>
				</div>
				<div className="flex flex-col gap-2 items-end">
					<button
						type="submit"
						aria-label="Submit"
						className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full md:w-1/4 px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50">
						Submit
					</button>
					<button
						type="button"
						aria-label="Reset"
						className="w-full md:w-1/4 px-5 py-2.5 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
						onClick={resetForm}>
						Reset
					</button>
				</div>
			</form>
		</div>
	);
}
