
import { handleServiceError, supabase } from './base-service';

// Image Handling
export interface IssueImage {
  id: string;
  issue_id: string;
  image_url: string;
  image_type: 'before' | 'after';
  uploaded_at: string;
  uploaded_by: string;
}

export const uploadIssueImage = async (
  issueId: string, 
  file: File, 
  imageType: 'before' | 'after',
  userId: string
) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${issueId}/${imageType}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('issue_images')
      .upload(filePath, file);

    if (uploadError) {
      throw handleServiceError(uploadError, 'Failed to upload image');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('issue_images')
      .getPublicUrl(filePath);

    // Add to database
    const { data, error } = await supabase
      .from('issue_images')
      .insert({
        issue_id: issueId,
        image_url: publicUrl,
        image_type: imageType,
        uploaded_by: userId
      })
      .select()
      .single();

    if (error) {
      throw handleServiceError(error, 'Failed to save image metadata');
    }

    return data;
  } catch (error) {
    throw handleServiceError(error, 'Failed to upload issue image');
  }
};

export const getIssueImages = async (issueId: string, imageType?: 'before' | 'after') => {
  try {
    let query = supabase
      .from('issue_images')
      .select('*')
      .eq('issue_id', issueId);

    if (imageType) {
      query = query.eq('image_type', imageType);
    }

    const { data, error } = await query.order('uploaded_at', { ascending: true });

    if (error) {
      throw handleServiceError(error, 'Failed to get issue images');
    }

    return data as IssueImage[];
  } catch (error) {
    throw handleServiceError(error, 'Failed to get issue images');
  }
};
