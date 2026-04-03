import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Parse the request body
        const { title, description, startDateTime, endDateTime, location, recurrence, eventId, family_id, reminderMinutes } = await req.json();
        
        // Validate required fields
        if (!title || !startDateTime) {
            return Response.json({ 
                error: 'חסרים שדות חובה: כותרת ותאריך התחלה נדרשים' 
            }, { status: 400 });
        }

        // Prepare the event object for Google Calendar
        const calendarEvent = {
            summary: title,
            description: description || '',
            location: location || '',
            start: {
                dateTime: startDateTime,
                timeZone: 'Asia/Jerusalem'
            },
            end: {
                dateTime: endDateTime || startDateTime,
                timeZone: 'Asia/Jerusalem'
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: reminderMinutes || 30 }
                ]
            }
        };

        // Add recurrence if provided
        if (recurrence) {
            calendarEvent.recurrence = [recurrence];
        }

        let googleCalendarSuccess = false;
        let googleEventId = null;
        let googleEventLink = null;
        let errorDetails = null;

        // Note: Google Calendar sync disabled - each user needs their own OAuth connection
        // Currently app connectors only support the app owner's account
        // Events are saved to the app database only
        googleCalendarSuccess = false;
        errorDetails = {
            type: 'not_configured',
            message: 'סנכרון יומן גוגל לא זמין - האירועים נשמרים באפליקציה בלבד'
        };

        // Save to app database
        let dbEventId = eventId;
        if (!dbEventId) {
            const dbEvent = await base44.asServiceRole.entities.Event.create({
                title,
                description: description || '',
                event_date: startDateTime,
                location: location || '',
                is_recurring: !!recurrence,
                recurrence_pattern: recurrence || '',
                family_id: family_id || user.family_id
            });
            dbEventId = dbEvent.id;
        }

        // Return appropriate response
        if (googleCalendarSuccess) {
            return Response.json({ 
                success: true,
                message: 'האירוע נוסף בהצלחה לאפליקציה וליומן גוגל! 📅✨',
                eventId: dbEventId,
                googleEventId: googleEventId,
                googleEventLink: googleEventLink,
                syncedToGoogle: true
            });
        } else {
            // Failed to sync to Google but saved locally
            let userMessage = 'האירוע נשמר באפליקציה, אך לא הצלחנו להוסיף אותו ליומן גוגל. ';
            
            if (errorDetails) {
                if (errorDetails.type === 'connection_error') {
                    userMessage += 'בעיית תקשורת עם גוגל. בדוק את החיבור שלך ונסה שוב.';
                } else if (errorDetails.status === 401 || errorDetails.status === 403) {
                    userMessage += 'יש צורך להתחבר מחדש ליומן גוגל.';
                } else if (errorDetails.reason === 'invalid') {
                    userMessage += 'פרטי האירוע אינם תקינים עבור גוגל. בדוק את התאריכים והשעות.';
                } else {
                    userMessage += `שגיאה: ${errorDetails.message}`;
                }
            }

            return Response.json({ 
                success: true,
                partial: true,
                message: userMessage,
                eventId: dbEventId,
                syncedToGoogle: false,
                canRetry: true,
                error: errorDetails
            });
        }

    } catch (error) {
        console.error('Error in addToGoogleCalendar:', error);
        return Response.json({ 
            error: 'שגיאה כללית בשמירת האירוע',
            details: error.message,
            canRetry: true
        }, { status: 500 });
    }
});