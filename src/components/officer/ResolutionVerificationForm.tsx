import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import { Progress } from '../ui/progress';
import { analyzeImagePair, AIVerificationResult } from '@/utils/ai-verification';
import { useAuth } from '@/hooks/useAuth';
import {
  getIssueImages,
  uploadIssueImage,
  createAIVerification,
  updateIssue
} from '@/services/supabase-service';

interface ResolutionVerificationFormProps {
  issue: any;
  onSuccess?: () => void;
}

const ResolutionVerificationForm: React.FC<ResolutionVerificationFormProps> = ({ 
  issue, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<AIVerificationResult | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  
  const [images, setImages] = useState<{
    file: File;
    preview: string;
  }[]>([]);

  useEffect(() => {
    const loadBeforeImages = async () => {
      try {
        const imagesData = await getIssueImages(issue.id, 'before');
        setBeforeImages(imagesData.map(img => img.image_url));
      } catch (error) {
        console.error('Error loading before images:', error);
        toast({
          title: "Error",
          description: "Failed to load issue images",
          variant: "destructive"
        });
      }
    };

    loadBeforeImages();
  }, [issue.id, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...newFiles]);
      setVerificationStatus(null);
      setVerificationMessage('');
      setVerificationResult(null);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    setVerificationStatus(null);
    setVerificationMessage('');
    setVerificationResult(null);
  };

  const verifyResolution = async () => {
    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one 'after' image to verify resolution",
        variant: "destructive"
      });
      return;
    }

    if (beforeImages.length === 0) {
      toast({
        title: "Validation Error",
        description: "No 'before' images available for comparison",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('pending');
    setVerificationProgress(0);

    try {
      const stages = [
        'Initializing AI models...',
        'Analyzing before image...',
        'Analyzing after image...',
        'Comparing structural elements...',
        'Detecting improvements...',
        'Finalizing verification...'
      ];
      
      for (let i = 0; i < stages.length; i++) {
        setVerificationMessage(stages[i]);
        setVerificationProgress(Math.floor((i / stages.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const beforeImageUrl = beforeImages[0];
      const afterImageUrl = images[0].preview;
      
      const result = await analyzeImagePair(beforeImageUrl, afterImageUrl, issue.category);
      setVerificationResult(result);
      
      setVerificationStatus(result.isResolved ? 'verified' : 'rejected');
      setVerificationMessage(result.feedback);
      
      if (result.isResolved) {
        toast({
          title: "Verification Successful",
          description: "AI has verified that the issue has been resolved",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "AI could not verify resolution. Please check the details and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Verification Error",
        description: "Failed to verify resolution. Please try again.",
        variant: "destructive"
      });
      setVerificationStatus(null);
    } finally {
      setVerificationProgress(100);
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one 'after' image",
        variant: "destructive"
      });
      return;
    }
    
    if (verificationStatus !== 'verified') {
      toast({
        title: "Verification Required",
        description: "Please verify the resolution before submitting",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Auth Error",
        description: "You must be logged in to submit a resolution",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      for (const image of images) {
        await uploadIssueImage(issue.id, image.file, 'after', user.id);
      }
      
      await createAIVerification({
        issue_id: issue.id,
        is_valid: true,
        processing_steps: verificationResult,
        verification_type: 'resolution'
      });
      
      await updateIssue(issue.id, {
        status: 'resolved',
        updated_at: new Date().toISOString()
      });
      
      toast({
        title: "Success",
        description: "Issue resolution has been verified and issue marked as resolved"
      });
      
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setVerificationStatus(null);
      setVerificationMessage('');
      setVerificationResult(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to submit resolution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassmorphicCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Verify Issue Resolution</h3>
      
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-2">Before Images</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {beforeImages.length > 0 ? (
            beforeImages.map((image, index) => (
              <div 
                key={`before-${index}`}
                className="aspect-square rounded-md overflow-hidden border border-border"
              >
                <img
                  src={image}
                  alt={`Before ${index}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No before images available</p>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>After Images (Required)</Label>
            {verificationStatus && (
              <div className={`flex items-center text-sm ${
                verificationStatus === 'verified' 
                  ? 'text-green-500' 
                  : verificationStatus === 'rejected' 
                    ? 'text-red-500' 
                    : 'text-amber-500'
              }`}>
                {verificationStatus === 'verified' && (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>Resolution Verified</span>
                  </>
                )}
                {verificationStatus === 'rejected' && (
                  <>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Resolution Not Verified</span>
                  </>
                )}
                {verificationStatus === 'pending' && (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    <span>Verifying...</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative group aspect-square rounded-md overflow-hidden border ${
                    verificationStatus === 'verified' 
                      ? 'border-green-400' 
                      : verificationStatus === 'rejected'
                        ? 'border-red-400' 
                        : 'border-border'
                  }`}
                >
                  <img
                    src={image.preview}
                    alt={`After ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
          
          {isVerifying && (
            <div className="space-y-2 my-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>AI Verification in Progress</span>
                <span>{verificationProgress}%</span>
              </div>
              <Progress value={verificationProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">{verificationMessage}</p>
            </div>
          )}
          
          {verificationResult && (
            <div className={`p-4 rounded-md text-sm space-y-3 ${
              verificationStatus === 'verified' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}>
              <p className="font-semibold">{verificationMessage}</p>
              
              {verificationResult.areas && verificationResult.areas.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium">Detailed Analysis:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {verificationResult.areas.map((area, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{area.name}</span>
                          <span>{Math.round(area.improvement * 100)}% improved</span>
                        </div>
                        <Progress 
                          value={area.improvement * 100} 
                          className="h-1.5"
                          style={{
                            ["--theme-primary" as any]: area.improvement > 0.6 
                              ? 'hsl(142, 76%, 36%)'
                              : area.improvement > 0.3 
                                ? 'hsl(48, 96%, 53%)'
                                : 'hsl(0, 84%, 60%)'
                          }}
                        />
                        <p className="text-xs opacity-80">{area.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="resolution-file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-medium">Upload 'after' images</span> showing the resolved issue
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or JPEG (MAX. 10MB)
                </p>
              </div>
              <input
                id="resolution-file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              onClick={verifyResolution}
              disabled={isVerifying || images.length === 0}
              className="w-full sm:w-1/2"
              variant="outline"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Resolution...
                </>
              ) : (
                <>
                  <Layers className="mr-2 h-4 w-4" />
                  Verify Resolution with AI
                </>
              )}
            </Button>
            
            <Button
              type="submit"
              disabled={isLoading || verificationStatus !== 'verified'}
              className="w-full sm:w-1/2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit & Resolve Issue'
              )}
            </Button>
          </div>
        </div>
      </form>
    </GlassmorphicCard>
  );
};

export default ResolutionVerificationForm;
