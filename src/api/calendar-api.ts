const API_ENDPOINT = "/api/calendar";

export class CalendarAPI {
    static async fetchCalendarData(): Promise<any> {
        try {
            const response = await fetch(API_ENDPOINT,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-cache",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch calendar data.");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Calendar fetch error:", error);
            throw new Error("An error occurred while fetching calendar data: " + error);
        }
    }

    static async applyCalendarChanges(start_date: string, end_date: string, dates_to_ignore: any): Promise<any> {
        if (!start_date || !end_date) {
            alert("Please select both a start and end date.");
            return;
        }

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    start_date,
                    end_date,
                    dates_to_ignore,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update calendar.");
            }
        } catch (error) {
            console.error("Calendar update error:", error);
            alert("An error occurred: " + error);
        }
    }
}
