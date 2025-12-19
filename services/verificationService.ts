import { supabase } from '../lib/supabase';
import { VerificationResult } from '../types';

// Type for verification record stored in database
export interface VerificationRecord {
    id?: string;
    user_id: string;
    block_id: string;
    activity_name: string;
    file_url: string;
    file_type: string;
    task_verified: boolean;
    focus_score: number;
    distractions_detected: string[];
    ai_critique: string;
    created_at?: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID
 * @returns The public URL of the uploaded file
 */
export const uploadFileToStorage = async (file: File, userId: string): Promise<string> => {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('verification-uploads')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from('verification-uploads')
        .getPublicUrl(data.path);

    return urlData.publicUrl;
};

/**
 * Save verification record to Supabase database
 * @param record - The verification record to save
 * @returns The saved record
 */
export const saveVerificationRecord = async (record: VerificationRecord): Promise<VerificationRecord> => {
    const { data, error } = await supabase
        .from('verifications')
        .insert([{
            user_id: record.user_id,
            block_id: record.block_id,
            activity_name: record.activity_name,
            file_url: record.file_url,
            file_type: record.file_type,
            task_verified: record.task_verified,
            focus_score: record.focus_score,
            distractions_detected: record.distractions_detected,
            ai_critique: record.ai_critique
        }])
        .select()
        .single();

    if (error) {
        console.error('Error saving verification record:', error);
        throw new Error(`Failed to save verification: ${error.message}`);
    }

    return data as VerificationRecord;
};

/**
 * Fetch all verification records for a user
 * @param userId - The user's ID
 * @returns Array of verification records
 */
export const fetchUserVerifications = async (userId: string): Promise<VerificationRecord[]> => {
    const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching verifications:', error);
        throw new Error(`Failed to fetch verifications: ${error.message}`);
    }

    return data as VerificationRecord[];
};

/**
 * Fetch today's verification records for a user
 * @param userId - The user's ID
 * @returns Array of today's verification records
 */
export const fetchTodayVerifications = async (userId: string): Promise<VerificationRecord[]> => {
    // Get start of today in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', todayISO)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching today verifications:', error);
        throw new Error(`Failed to fetch today verifications: ${error.message}`);
    }

    return data as VerificationRecord[];
};

/**
 * Fetch verification records for a specific date
 * @param userId - The user's ID
 * @param date - The date to fetch verifications for
 * @returns Array of verification records for that date
 */
export const fetchVerificationsByDate = async (userId: string, date: Date): Promise<VerificationRecord[]> => {
    // Get start of the selected date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Get end of the selected date
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching verifications by date:', error);
        throw new Error(`Failed to fetch verifications: ${error.message}`);
    }

    return data as VerificationRecord[];
};

/**
 * Complete verification flow: upload file, analyze with AI, save to database
 * @param file - The file to verify
 * @param blockId - The schedule block ID
 * @param activityName - The activity name
 * @param userId - The user's ID
 * @param analysisResult - The AI analysis result
 * @returns The saved verification record
 */
export const completeVerification = async (
    file: File,
    blockId: string,
    activityName: string,
    userId: string,
    analysisResult: VerificationResult
): Promise<VerificationRecord> => {
    // Upload file to storage
    const fileUrl = await uploadFileToStorage(file, userId);

    // Prepare the record
    const record: VerificationRecord = {
        user_id: userId,
        block_id: blockId,
        activity_name: activityName,
        file_url: fileUrl,
        file_type: file.type,
        task_verified: analysisResult.task_verified,
        focus_score: analysisResult.focus_score,
        distractions_detected: analysisResult.distractions_detected,
        ai_critique: analysisResult.ai_critique
    };

    // Save to database
    const savedRecord = await saveVerificationRecord(record);

    return savedRecord;
};

/**
 * Get verification statistics for a user
 * @param userId - The user's ID
 * @returns Statistics object
 */
export const getVerificationStats = async (userId: string) => {
    const allVerifications = await fetchUserVerifications(userId);
    const todayVerifications = await fetchTodayVerifications(userId);

    const totalVerified = allVerifications.filter(v => v.task_verified).length;
    const totalFocusScore = allVerifications.reduce((sum, v) => sum + v.focus_score, 0);
    const avgFocusScore = allVerifications.length > 0 ? totalFocusScore / allVerifications.length : 0;

    const todayVerified = todayVerifications.filter(v => v.task_verified).length;
    const todayFocusScore = todayVerifications.reduce((sum, v) => sum + v.focus_score, 0);

    return {
        total: {
            count: allVerifications.length,
            verified: totalVerified,
            avgFocusScore: Math.round(avgFocusScore * 10) / 10
        },
        today: {
            count: todayVerifications.length,
            verified: todayVerified,
            focusPoints: todayFocusScore
        },
        history: allVerifications
    };
};
