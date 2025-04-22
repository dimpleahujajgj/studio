'use client';

import Image from 'next/image';
import {useState, useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import {analyzeXrayImage} from '@/ai/flows/analyze-xray-image';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

function ImageUploader({onImageUpload}: { onImageUpload: (file: File) => void }) {
  const onDrop = useCallback(acceptedFiles => {
    onImageUpload(acceptedFiles[0]);
  }, [onImageUpload]);
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: {'image/*': ['.png', '.jpg', '.jpeg']}})

  return (
    <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-64 p-4 border-2 border-dashed rounded-md cursor-pointer bg-muted hover:bg-accent">
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the image here ...</p> :
          <p>Drag 'n' drop an image here, or click to select one</p>
      }
    </div>
  );
}

function ImageDisplay({image}: { image: string }) {
  return (
    <div className="relative w-full h-64">
      <Image src={image} alt="Uploaded X-ray" fill style={{objectFit: 'contain'}} className="rounded-md"/>
    </div>
  );
}

function AnalysisResult({analysis, confidence}: { analysis: string, confidence: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>AI-powered analysis of the X-ray image</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p>{analysis}</p>
        <Badge>Confidence: {(confidence * 100).toFixed(2)}%</Badge>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const handleImageUpload = async (file: File) => {
    setImage(URL.createObjectURL(file));
    try {
      const base64 = await convertToBase64(file);
      const result = await analyzeXrayImage({photoUrl: base64 as string});
      setAnalysis(result.analysis.issues);
      setConfidence(result.analysis.confidenceScore);
    } catch (error: any) {
      console.error("Error analyzing image:", error);
      setAnalysis(`Analysis failed: ${error.message || 'Unknown error'}`);
      setConfidence(0);
    }
  };

  const convertToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-primary">X-Ray Insights</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <ImageUploader onImageUpload={handleImageUpload}/>
          {image && <ImageDisplay image={image}/>}
        </div>
        <div>
          {analysis && confidence !== null && (
            <AnalysisResult analysis={analysis} confidence={confidence}/>
          )}
          {!image && (
            <Card>
              <CardHeader>
                <CardTitle>Upload an X-Ray Image</CardTitle>
                <CardDescription>Get insights into your X-ray images.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Upload an X-ray image to receive an AI-powered analysis of potential issues and abnormalities.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
