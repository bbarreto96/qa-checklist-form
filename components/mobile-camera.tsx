"use client";

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Download, 
  Trash2,
  ZoomIn,
  ZoomOut,
  FlashlightIcon as Flashlight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileCameraProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  onClose: () => void;
  maxPhotos?: number;
  currentPhotoCount?: number;
  className?: string;
}

export default function MobileCamera({
  onPhotoCapture,
  onClose,
  maxPhotos = 5,
  currentPhotoCount = 0,
  className
}: MobileCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [zoom, setZoom] = useState(1);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply zoom if set
    if (zoom !== 1) {
      const scaledWidth = canvas.width / zoom;
      const scaledHeight = canvas.height / zoom;
      const offsetX = (canvas.width - scaledWidth) / 2;
      const offsetY = (canvas.height - scaledHeight) / 2;
      
      context.drawImage(
        video,
        offsetX, offsetY, scaledWidth, scaledHeight,
        0, 0, canvas.width, canvas.height
      );
    } else {
      context.drawImage(video, 0, 0);
    }

    // Convert to data URL with high quality
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photoDataUrl);
    stopCamera();
  }, [zoom, stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCamera();
  }, [startCamera]);

  const savePhoto = useCallback(() => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
      onClose();
    }
  }, [capturedPhoto, onPhotoCapture, onClose]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select a file under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedPhoto(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isStreaming) {
      stopCamera();
      // Restart with new facing mode
      setTimeout(startCamera, 100);
    }
  }, [isStreaming, stopCamera, startCamera]);

  const adjustZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 0.2 : prev - 0.2;
      return Math.max(1, Math.min(3, newZoom));
    });
  }, []);

  // Start camera on mount
  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const canTakeMorePhotos = currentPhotoCount < maxPhotos;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-black flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 text-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-white border-white/30">
            {currentPhotoCount}/{maxPhotos} photos
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-white hover:bg-white/20"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {!capturedPhoto ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center'
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Controls Overlay */}
            {isStreaming && (
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Top Controls */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    {/* Flash Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFlashEnabled(!flashEnabled)}
                      className={cn(
                        "text-white hover:bg-white/20 w-10 h-10 p-0",
                        flashEnabled && "bg-yellow-500/30"
                      )}
                    >
                      <Flashlight className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Zoom Controls */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustZoom('in')}
                      disabled={zoom >= 3}
                      className="text-white hover:bg-white/20 w-10 h-10 p-0"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => adjustZoom('out')}
                      disabled={zoom <= 1}
                      className="text-white hover:bg-white/20 w-10 h-10 p-0"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="flex justify-center items-center">
                  <div className="flex items-center gap-6">
                    {/* Switch Camera */}
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={switchCamera}
                      className="text-white hover:bg-white/20 w-12 h-12 p-0"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>

                    {/* Capture Button */}
                    <Button
                      size="lg"
                      onClick={capturePhoto}
                      disabled={!canTakeMorePhotos}
                      className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 text-black border-4 border-white/30"
                    >
                      <Camera className="w-8 h-8" />
                    </Button>

                    {/* Placeholder for symmetry */}
                    <div className="w-12 h-12" />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Photo Preview */
          <div className="w-full h-full relative">
            <img
              src={capturedPhoto}
              alt="Captured photo"
              className="w-full h-full object-contain bg-black"
            />
            
            {/* Photo Actions */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="bg-black/50 text-white border-white/30 hover:bg-black/70"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              
              <Button
                onClick={savePhoto}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="absolute top-20 left-4 right-4 bg-red-50 border-red-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-700 text-sm">
              <X className="w-4 h-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo Limit Warning */}
      {!canTakeMorePhotos && (
        <Card className="absolute top-20 left-4 right-4 bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-700 text-sm">
              <Camera className="w-4 h-4" />
              Maximum number of photos reached ({maxPhotos})
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
