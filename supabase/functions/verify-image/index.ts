
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type VerificationRequest = {
  issueId: string;
  beforeImageUrl: string;
  afterImageUrl?: string;
  verificationType: 'issue' | 'resolution';
  category: string;
}

type AnalysisResult = {
  isValid: boolean;
  feedback: string;
  areas?: {
    name: string;
    improvement: number;
    details: string;
  }[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request data
    const requestData: VerificationRequest = await req.json()
    const { issueId, beforeImageUrl, afterImageUrl, verificationType, category } = requestData

    // Perform analysis based on verification type
    let result: AnalysisResult

    if (verificationType === 'issue') {
      // For issue verification, we just check if the image is valid for the issue category
      result = await verifyIssueImage(beforeImageUrl, category)
    } else if (verificationType === 'resolution') {
      // For resolution verification, we compare before and after images
      if (!afterImageUrl) {
        throw new Error('After image URL is required for resolution verification')
      }
      result = await verifyResolution(beforeImageUrl, afterImageUrl, category)
    } else {
      throw new Error('Invalid verification type')
    }

    // Save verification result to database
    const { data, error } = await supabase
      .from('ai_verifications')
      .insert({
        issue_id: issueId,
        is_valid: result.isValid,
        processing_steps: result,
        verification_type: verificationType,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, verification: data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Mock function for issue image verification
async function verifyIssueImage(imageUrl: string, category: string): Promise<AnalysisResult> {
  // In a real implementation, this would call a computer vision API
  // to analyze the image and determine if it matches the issue category
  
  // For demo purposes, we'll assume most images are valid
  const isValid = Math.random() > 0.1 // 90% chance of being valid
  
  return {
    isValid,
    feedback: isValid 
      ? `The image has been verified as a valid ${category} issue.` 
      : `The image does not appear to show a ${category} issue. Please upload a clearer image.`,
  }
}

// Mock function for resolution verification
async function verifyResolution(beforeUrl: string, afterUrl: string, category: string): Promise<AnalysisResult> {
  // In a real implementation, this would call a computer vision API
  // to compare the before and after images and determine if the issue has been resolved
  
  // For demo purposes, we'll generate a random result with 70% chance of success
  const isResolved = Math.random() > 0.3
  
  // Generate random improvement areas
  const areas = [{
    name: 'Cleanliness',
    improvement: Math.random() * (isResolved ? 0.6 : 0.4) + (isResolved ? 0.4 : 0),
    details: isResolved 
      ? 'Significant improvement in cleanliness observed.' 
      : 'Minor improvement in cleanliness, but not sufficient.'
  }, {
    name: 'Structural Integrity',
    improvement: Math.random() * (isResolved ? 0.7 : 0.3) + (isResolved ? 0.3 : 0),
    details: isResolved 
      ? 'Structure has been properly repaired.' 
      : 'Some repair work done, but structure still needs attention.'
  }, {
    name: 'Safety Hazards',
    improvement: Math.random() * (isResolved ? 0.9 : 0.2) + (isResolved ? 0.1 : 0),
    details: isResolved 
      ? 'All safety hazards have been addressed.' 
      : 'Safety issues still present and need immediate attention.'
  }]
  
  return {
    isValid: isResolved,
    feedback: isResolved 
      ? `The ${category} issue has been successfully resolved. Our AI verification confirms significant improvements.` 
      : `The ${category} issue has not been fully resolved. Please address the remaining issues before submitting again.`,
    areas
  }
}
