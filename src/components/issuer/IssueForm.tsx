import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createIssue, verifyImageWithAI } from '@/utils/issues-service';
import { Loader2, Upload, X, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassmorphicCard from '../ui/GlassmorphicCard';
import LocationPicker from '../maps/LocationPicker';

interface IssueFormProps {
  onSuccess?: () => void;
}

const categories = [
  'Water Supply',
  'Electricity',
  'Roads',
  'Garbage Collection',
  'Sewage',
  'Street Lights',
  'Public Property',
  'Parks',
  'Other'
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const IssueForm: React.FC<IssueFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected' | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    coordinates: {
      lat: 0,
      lng: 0
    },
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  
  const [images, setImages] = useState<{
    file: File;
    preview: string;
    verified?: boolean;
    verificationMessage?: string;
  }[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset verification when category changes
    if (name === 'category' && images.length > 0) {
      setVerificationStatus(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setImages(prev => [...prev, ...newFiles]);
      // Reset verification status when new images are added
      setVerificationStatus(null);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      location: location.address,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      }
    }));
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
    // Reset verification status when images are removed
    setVerificationStatus(null);
  };

  const verifyImages = async () => {
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category before verifying images",
        variant: "destructive"
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one image to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      // Verify each image with AI
      const verificationPromises = images.map(async (image, index) => {
        // In real app, we would upload the image to a server and get a URL
        // For this demo, we'll use the mock implementation with the image preview URL
        const result = await verifyImageWithAI(image.preview, formData.category);
        
        return {
          index,
          verified: result.success,
          message: result.message
        };
      });

      const results = await Promise.all(verificationPromises);
      
      // Update images with verification results
      const updatedImages = [...images];
      results.forEach(result => {
        updatedImages[result.index] = {
          ...updatedImages[result.index],
          verified: result.verified,
          verificationMessage: result.message
        };
      });
      
      setImages(updatedImages);
      
      // Overall verification status
      const allVerified = results.every(result => result.verified);
      setVerificationStatus(allVerified ? 'verified' : 'rejected');
      
      if (allVerified) {
        toast({
          title: "Verification Successful",
          description: "All images have been verified for the selected category",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "Some images could not be verified. Please check the details and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Verification Error",
        description: "Failed to verify images. Please try again.",
        variant: "destructive"
      });
      setVerificationStatus(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to report an issue",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (images.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one image of the issue",
        variant: "destructive"
      });
      return;
    }
    
    if (verificationStatus !== 'verified') {
      toast({
        title: "Verification Required",
        description: "Please verify your images before submitting",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, we'd upload the images to storage and get URLs
      // For this demo, we'll use the file names
      const imageNames = images.map(img => img.file.name);
      
      const newIssue = await createIssue({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        coordinates: {
          lat: formData.coordinates.lat,
          lng: formData.coordinates.lng
        },
        priority: formData.priority,
        status: 'pending',
        userId: user.id,
        beforeImages: imageNames,
        ai_verification_status: 'verified'
      });
      
      toast({
        title: "Success",
        description: "Issue reported successfully"
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        coordinates: {
          lat: 0,
          lng: 0
        },
        priority: 'medium'
      });
      
      // Clean up image previews
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setVerificationStatus(null);
      setShowMap(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to report issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassmorphicCard className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Issue Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of the issue"
            className="glass-input"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleSelectChange('priority', value as 'low' | 'medium' | 'high')}
            >
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="location">Location</Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowMap(!showMap)}
              className="text-primary"
            >
              <MapPin className="h-4 w-4 mr-1" />
              {showMap ? "Hide Map" : "Select on Map"}
            </Button>
          </div>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where is the issue located?"
            className="glass-input"
            required
          />
          
          {formData.coordinates.lat !== 0 && formData.coordinates.lng !== 0 && (
            <p className="text-xs text-muted-foreground">
              Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
            </p>
          )}
          
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showMap ? 'auto' : 0,
              opacity: showMap ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {showMap && (
              <div className="pt-4">
                <LocationPicker 
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    formData.coordinates.lat !== 0 && formData.coordinates.lng !== 0
                      ? formData.coordinates
                      : undefined
                  }
                />
              </div>
            )}
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Detailed Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide details about the issue..."
            className="glass-input min-h-[120px]"
            required
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Images (Required)</Label>
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
                    <span>Verified</span>
                  </>
                )}
                {verificationStatus === 'rejected' && (
                  <>
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Not Verified</span>
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
                    image.verified === true 
                      ? 'border-green-400' 
                      : image.verified === false 
                        ? 'border-red-400' 
                        : 'border-border'
                  }`}
                >
                  <img
                    src={image.preview}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  {image.verified !== undefined && (
                    <div className={`absolute top-0 left-0 right-0 p-1 text-xs text-white ${
                      image.verified ? 'bg-green-500/80' : 'bg-red-500/80'
                    }`}>
                      {image.verified ? 'Verified' : 'Not Verified'}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {image.verificationMessage && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white bg-black/70">
                      {image.verificationMessage}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or JPEG (MAX. 10MB)
                </p>
              </div>
              <input
                id="file-upload"
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
              onClick={verifyImages}
              disabled={isVerifying || !formData.category || images.length === 0}
              className="w-full sm:w-1/2"
              variant="outline"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Images with AI'
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
                'Submit Issue Report'
              )}
            </Button>
          </div>
        </div>
      </form>
    </GlassmorphicCard>
  );
};

export default IssueForm;
