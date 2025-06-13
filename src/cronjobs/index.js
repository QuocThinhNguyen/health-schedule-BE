import cron from "node-cron";  
import {runReminder1DayJob,runReminder1HourJob} from "./reminderAppointmentJob.js";

export default async function initializeCronJobs() {
 cron.schedule("0 8 * * *", runReminder1DayJob);
 cron.schedule("0 * * * *", runReminder1HourJob);
// cron.schedule("20 11 * * *", runReminder1DayJob);
// cron.schedule("*/5 * * * *", runReminder1HourJob);
}
