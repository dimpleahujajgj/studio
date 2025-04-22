'use server';
/**
 * @fileOverview An X-ray image analysis AI agent.
 *
 * - analyzeXrayImage - A function that handles the X-ray image analysis process.
 * - AnalyzeXrayImageInput - The input type for the analyzeXrayImage function.
 * - AnalyzeXrayImageOutput - The return type for the analyzeXrayImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeXrayImageInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the X-ray image.'),
});
export type AnalyzeXrayImageInput = z.infer<typeof AnalyzeXrayImageInputSchema>;

const AnalyzeXrayImageOutputSchema = z.object({
  analysis: z.object({
    hasIssues: z.boolean().describe('Whether or not the X-ray image shows any issues.'),
    issues: z.string().describe('The description of the issues found in the X-ray image.'),
    confidenceScore: z.number().describe('The confidence score of the analysis (0-1).'),
  }),
});
export type AnalyzeXrayImageOutput = z.infer<typeof AnalyzeXrayImageOutputSchema>;

export async function analyzeXrayImage(input: AnalyzeXrayImageInput): Promise<AnalyzeXrayImageOutput> {
  return analyzeXrayImageFlow(input);
}

const analyzeXrayImagePrompt = ai.definePrompt({
  name: 'analyzeXrayImagePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the X-ray image.'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z.object({
        hasIssues: z.boolean().describe('Whether or not the X-ray image shows any issues.'),
        issues: z.string().describe('The description of the issues found in the X-ray image.'),
        confidenceScore: z.number().describe('The confidence score of the analysis (0-1).'),
      }),
    }),
  },
  prompt: `You are an expert radiologist specializing in analyzing X-ray images.

You will analyze the X-ray image and identify any potential bone issues, fractures, or abnormalities.

Based on your analysis, you will determine whether the X-ray image shows any issues and provide a description of the issues found.  You will also provide a confidence score for your analysis.

Use the following as the primary source of information about the X-ray image.

X-ray Image: {{media url=photoUrl}}`,
});

const analyzeXrayImageFlow = ai.defineFlow<
  typeof AnalyzeXrayImageInputSchema,
  typeof AnalyzeXrayImageOutputSchema
>({
  name: 'analyzeXrayImageFlow',
  inputSchema: AnalyzeXrayImageInputSchema,
  outputSchema: AnalyzeXrayImageOutputSchema,
}, async input => {
  const {output} = await analyzeXrayImagePrompt(input);
  return output!;
});
