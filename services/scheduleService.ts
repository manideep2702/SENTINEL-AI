import { supabase } from '../lib/supabase';
import { ScheduleBlock, ActivityType } from '../types';

// Default schedule for new users
export const DEFAULT_SCHEDULE: ScheduleBlock[] = [
    { id: '1', start: '06:00', end: '07:00', activity: 'Morning Routine', type: ActivityType.WORKOUT },
    { id: '2', start: '09:00', end: '12:00', activity: 'Work / Study', type: ActivityType.DEEP_STUDY },
    { id: '3', start: '14:00', end: '17:00', activity: 'Work / Study', type: ActivityType.STUDY },
    { id: '4', start: '18:00', end: '19:00', activity: 'Exercise', type: ActivityType.WALK },
];

export interface UserSchedule {
    id?: string;
    user_id: string;
    schedule: ScheduleBlock[];
    created_at?: string;
    updated_at?: string;
}

/**
 * Get user's custom schedule from database
 */
export const getUserSchedule = async (userId: string): Promise<ScheduleBlock[] | null> => {
    try {
        const { data, error } = await supabase
            .from('user_schedules')
            .select('schedule')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No schedule found - user needs to create one
                return null;
            }
            console.error('Error fetching schedule:', error);
            return null;
        }

        return data?.schedule || null;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return null;
    }
};

/**
 * Save or update user's schedule
 */
export const saveUserSchedule = async (userId: string, schedule: ScheduleBlock[]): Promise<boolean> => {
    try {
        // Check if schedule exists
        const { data: existing } = await supabase
            .from('user_schedules')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Update existing schedule
            const { error } = await supabase
                .from('user_schedules')
                .update({
                    schedule,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            // Insert new schedule
            const { error } = await supabase
                .from('user_schedules')
                .insert([{
                    user_id: userId,
                    schedule
                }]);

            if (error) throw error;
        }

        console.log('✅ Schedule saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving schedule:', error);
        return false;
    }
};

/**
 * Delete user's schedule
 */
export const deleteUserSchedule = async (userId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('user_schedules')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return false;
    }
};

/**
 * Detect activity type based on keywords in the activity name
 */
export const detectActivityType = (activityName: string): ActivityType => {
    const lower = activityName.toLowerCase();

    // Fitness & Health
    if (lower.includes('workout') || lower.includes('exercise')) return ActivityType.WORKOUT;
    if (lower.includes('gym') || lower.includes('weight')) return ActivityType.GYM;
    if (lower.includes('yoga') || lower.includes('stretching')) return ActivityType.YOGA;
    if (lower.includes('walk') || lower.includes('walking')) return ActivityType.WALK;
    if (lower.includes('run') || lower.includes('jog')) return ActivityType.RUNNING;
    if (lower.includes('sport') || lower.includes('game') || lower.includes('play')) return ActivityType.SPORTS;

    // Learning & Education
    if (lower.includes('class') && !lower.includes('master')) return ActivityType.CLASS;
    if (lower.includes('lecture') || lower.includes('seminar')) return ActivityType.LECTURE;
    if (lower.includes('deep study') || lower.includes('focus study') || lower.includes('deep work')) return ActivityType.DEEP_STUDY;
    if (lower.includes('read')) return ActivityType.READING;
    if (lower.includes('homework') || lower.includes('assignment')) return ActivityType.HOMEWORK;
    if (lower.includes('exam') || lower.includes('test prep')) return ActivityType.EXAM_PREP;
    if (lower.includes('course') || lower.includes('tutorial')) return ActivityType.ONLINE_COURSE;
    if (lower.includes('study')) return ActivityType.STUDY;

    // Work & Productivity
    if (lower.includes('meeting') || lower.includes('call') || lower.includes('standup')) return ActivityType.MEETING;
    if (lower.includes('coding') || lower.includes('programming') || lower.includes('code')) return ActivityType.CODING;
    if (lower.includes('writ') || lower.includes('blog') || lower.includes('content')) return ActivityType.WRITING;
    if (lower.includes('project')) return ActivityType.PROJECT;
    if (lower.includes('research')) return ActivityType.RESEARCH;
    if (lower.includes('office') || lower.includes('work from office')) return ActivityType.OFFICE;
    if (lower.includes('work')) return ActivityType.WORK;

    // Personal & Daily
    if (lower.includes('morning') || lower.includes('routine') || lower.includes('wake')) return ActivityType.MORNING_ROUTINE;
    if (lower.includes('breakfast')) return ActivityType.BREAKFAST;
    if (lower.includes('lunch')) return ActivityType.LUNCH;
    if (lower.includes('dinner') || lower.includes('supper')) return ActivityType.DINNER;
    if (lower.includes('break') || lower.includes('rest') || lower.includes('relax')) return ActivityType.BREAK;
    if (lower.includes('nap') || lower.includes('sleep')) return ActivityType.NAP;
    if (lower.includes('meditat') || lower.includes('mindful')) return ActivityType.MEDITATION;
    if (lower.includes('commute') || lower.includes('travel') || lower.includes('drive')) return ActivityType.COMMUTE;

    // Creative & Hobbies
    if (lower.includes('music') || lower.includes('guitar') || lower.includes('piano') || lower.includes('practice')) return ActivityType.MUSIC;
    if (lower.includes('art') || lower.includes('draw') || lower.includes('paint')) return ActivityType.ART;
    if (lower.includes('gaming') || lower.includes('video game')) return ActivityType.GAMING;
    if (lower.includes('side project') || lower.includes('personal project')) return ActivityType.SIDE_PROJECT;

    // Social & Family
    if (lower.includes('family') || lower.includes('kids') || lower.includes('children')) return ActivityType.FAMILY_TIME;
    if (lower.includes('social') || lower.includes('friends') || lower.includes('hangout')) return ActivityType.SOCIAL;
    if (lower.includes('phone') || lower.includes('calls')) return ActivityType.PHONE_CALLS;

    // Default
    return ActivityType.OTHER;
};

/**
 * Parse a timetable text into schedule blocks
 */
export const parseTimetableText = (text: string): ScheduleBlock[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const schedule: ScheduleBlock[] = [];

    lines.forEach((line, index) => {
        // Try to match patterns like "6:00 - 7:00 Morning Workout" or "06:00-07:00: Study"
        const timePattern = /(\d{1,2}:\d{2})\s*[-–to]+\s*(\d{1,2}:\d{2})[:\s]*(.+)/i;
        const match = line.match(timePattern);

        if (match) {
            const [, start, end, activity] = match;
            const activityTrimmed = activity.trim();

            // Auto-detect activity type based on keywords
            const type = detectActivityType(activityTrimmed);

            schedule.push({
                id: `custom-${index + 1}`,
                start: start.padStart(5, '0'),
                end: end.padStart(5, '0'),
                activity: activityTrimmed,
                type
            });
        }
    });

    // Sort by start time
    schedule.sort((a, b) => a.start.localeCompare(b.start));

    return schedule;
};

/**
 * Validate schedule blocks
 */
export const validateSchedule = (schedule: ScheduleBlock[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (schedule.length === 0) {
        errors.push('Schedule must have at least one activity');
        return { valid: false, errors };
    }

    schedule.forEach((block, index) => {
        // Check time format
        if (!/^\d{2}:\d{2}$/.test(block.start) || !/^\d{2}:\d{2}$/.test(block.end)) {
            errors.push(`Activity ${index + 1}: Invalid time format`);
        }

        // Check start < end
        if (block.start >= block.end) {
            errors.push(`Activity ${index + 1}: End time must be after start time`);
        }

        // Check activity name
        if (!block.activity || block.activity.trim().length === 0) {
            errors.push(`Activity ${index + 1}: Activity name is required`);
        }
    });

    // Check for overlapping times
    for (let i = 0; i < schedule.length - 1; i++) {
        if (schedule[i].end > schedule[i + 1].start) {
            errors.push(`Activities ${i + 1} and ${i + 2} have overlapping times`);
        }
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Parse Excel file into schedule blocks
 */
export const parseExcelFile = async (file: File): Promise<ScheduleBlock[]> => {
    try {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

        const schedule: ScheduleBlock[] = [];
        let blockIndex = 0;

        // Process each row
        data.forEach((row) => {
            if (!row || row.length < 2) return;

            // Try to find time and activity in the row
            const rowText = row.join(' ');

            // Try common patterns
            // Pattern 1: Time range in one column, activity in another
            // Pattern 2: All in one cell
            const timePattern = /(\d{1,2}[:.]\d{2})\s*[-–to]+\s*(\d{1,2}[:.]\d{2})/;
            const match = rowText.match(timePattern);

            if (match) {
                let start = match[1].replace('.', ':').padStart(5, '0');
                let end = match[2].replace('.', ':').padStart(5, '0');

                // Extract activity name (everything after the time)
                const afterTime = rowText.substring(rowText.indexOf(match[0]) + match[0].length).trim();
                const activity = afterTime || row.find(cell =>
                    cell && typeof cell === 'string' &&
                    !cell.match(/^\d{1,2}[:.]\d{2}/) &&
                    cell.trim().length > 0
                ) || 'Activity';

                // Auto-detect activity type using the centralized function
                const type = detectActivityType(activity);

                blockIndex++;
                schedule.push({
                    id: `excel-${blockIndex}`,
                    start,
                    end,
                    activity: activity.trim(),
                    type
                });
            }
        });

        // Sort by start time
        schedule.sort((a, b) => a.start.localeCompare(b.start));

        console.log('📊 Parsed Excel schedule:', schedule);
        return schedule;
    } catch (error) {
        console.error('Error parsing Excel file:', error);
        throw new Error('Failed to parse Excel file. Please check the format.');
    }
};

/**
 * Parse PDF file into schedule blocks
 * Uses multiple strategies to extract text from PDF
 */
export const parsePDFFile = async (file: File): Promise<ScheduleBlock[]> => {
    console.log('📄 Starting PDF parsing for:', file.name);

    let fullText = '';

    // Strategy 1: Try using pdfjs-dist
    try {
        const pdfjsLib = await import('pdfjs-dist');

        // Set worker source from CDN - use .mjs for modern browsers
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const buffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;

        // Extract text from all pages
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        console.log('📄 Extracted PDF text (pdfjs):', fullText.substring(0, 300));
    } catch (pdfError) {
        console.warn('⚠️ pdfjs-dist failed:', pdfError);

        // Strategy 2: Try reading PDF as raw text (works for some simple PDFs)
        try {
            const rawText = await file.text();
            // Extract text from PDF literal strings
            const textMatches = rawText.match(/\(([^)]{2,100})\)/g);
            if (textMatches && textMatches.length > 0) {
                fullText = textMatches
                    .map(m => m.slice(1, -1))
                    .filter(t => /[a-zA-Z0-9]/.test(t))
                    .join(' ');
                console.log('📄 Extracted PDF text (raw):', fullText.substring(0, 300));
            }
        } catch (rawError) {
            console.warn('⚠️ Raw PDF extraction failed:', rawError);
        }
    }

    // If no text was extracted, throw helpful error
    if (!fullText || fullText.trim().length < 10) {
        throw new Error(
            'Could not extract text from this PDF.\n\n' +
            'Try one of these alternatives:\n' +
            '• Use the "Paste" tab - copy text from your PDF and paste it\n' +
            '• Use Excel format (.xlsx) instead\n' +
            '• Enter your schedule manually'
        );
    }

    // Parse the extracted text
    let schedule = parseTimetableText(fullText);

    // If simple parsing didn't work, try more patterns
    if (schedule.length === 0) {
        const lines = fullText.split(/[\n\r]+/);
        let blockIndex = 0;

        lines.forEach(line => {
            const patterns = [
                /(\d{1,2}[:.]\d{2})\s*(?:AM|PM|am|pm)?\s*[-–to]+\s*(\d{1,2}[:.]\d{2})\s*(?:AM|PM|am|pm)?\s*[:\-–\s]*(.+)/i,
                /(\d{1,2})\s*(?:AM|PM|am|pm)\s*[-–to]+\s*(\d{1,2})\s*(?:AM|PM|am|pm)\s*[:\-–\s]*(.+)/i,
            ];

            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    let start = match[1].replace('.', ':');
                    let end = match[2].replace('.', ':');

                    if (!start.includes(':')) start += ':00';
                    if (!end.includes(':')) end += ':00';

                    start = start.padStart(5, '0');
                    end = end.padStart(5, '0');

                    const activity = match[3]?.trim() || 'Activity';
                    const type = detectActivityType(activity);

                    blockIndex++;
                    schedule.push({
                        id: `pdf-${blockIndex}`,
                        start,
                        end,
                        activity,
                        type
                    });
                    break;
                }
            }
        });
    }

    // Sort by start time
    schedule.sort((a, b) => a.start.localeCompare(b.start));

    if (schedule.length === 0) {
        throw new Error(
            'Found text but no schedule entries.\n\n' +
            'Make sure your PDF has times like:\n' +
            '• "09:00 - 12:00 Study Session"\n' +
            '• "2:00 PM - 5:00 PM Work"\n\n' +
            'Or try the "Paste" tab instead.'
        );
    }

    console.log('📄 Parsed PDF schedule:', schedule);
    return schedule;
};

/**
 * Parse uploaded file (supports Excel, PDF, and text files)
 */
export const parseScheduleFile = async (file: File): Promise<ScheduleBlock[]> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return parseExcelFile(file);
    } else if (fileName.endsWith('.pdf')) {
        return parsePDFFile(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
        const text = await file.text();
        return parseTimetableText(text);
    } else {
        throw new Error('Unsupported file format. Please upload PDF, Excel, or text files.');
    }
};
