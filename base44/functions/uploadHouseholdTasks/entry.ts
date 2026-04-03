import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url, month_year } = await req.json();
        
        if (!file_url || !month_year) {
            return Response.json({ 
                error: 'Missing required fields: file_url and month_year are required' 
            }, { status: 400 });
        }

        // Define the expected JSON schema for household tasks
        const taskSchema = {
            type: "object",
            properties: {
                tasks: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            description: { type: "string" },
                            assigned_to: { type: "string" },
                            due_date: { type: "string" },
                            category: { type: "string" },
                            priority: { type: "string" },
                            recurrence_pattern: { type: "string" }
                        },
                        required: ["title", "due_date"]
                    }
                }
            }
        };

        // Extract data from the uploaded file
        const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: file_url,
            json_schema: taskSchema
        });

        if (extractResult.status === 'error') {
            return Response.json({
                success: false,
                error: extractResult.details || 'Failed to extract data from file'
            }, { status: 400 });
        }

        // Parse the extracted tasks
        const extractedTasks = extractResult.output?.tasks || [];
        
        // Prepare tasks for preview (don't create yet)
        const parsedTasks = extractedTasks.map(task => ({
            title: task.title,
            description: task.description || '',
            assigned_to: task.assigned_to || '',
            due_date: task.due_date,
            month_year: month_year,
            category: task.category || 'other',
            priority: task.priority || 'medium',
            recurrence_pattern: task.recurrence_pattern || 'none',
            is_completed: false,
            family_id: user.family_id
        }));

        return Response.json({
            success: true,
            tasks: parsedTasks,
            count: parsedTasks.length,
            message: `Successfully extracted ${parsedTasks.length} tasks`
        });

    } catch (error) {
        console.error('Error in uploadHouseholdTasks:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});