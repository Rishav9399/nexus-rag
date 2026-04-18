import { embed, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        const { jobDescription } = await req.json();

        if(!jobDescription) {
            return NextResponse.json({ error: "No job description provided"}, { status: 400 });
        }

        // STEP 1: Vectorize the Job Description (Tanslate to 3072 dimentions)
        const { embedding } = await embed({
            model: google.textEmbeddingModel('gemini-embedding-001'),
            value: jobDescription,
        });

        // STEP 2: retrive Matching Memory from the Vault
        // We call the custom SQL function we wrote earlier to find the closet matches
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.0,  // Lower number = more lenient matching
            match_count: 5,    // Bring back the top 5 most relevant resume points
        });

        if (error) throw error;

        // Combine the retrieved resume points into a single context block
        const resumeContext = documents.map((doc: any) => doc.content).join('\n- ');
        
        // SREP 3: Generate the Brutal Feedback
        const prompt = `
            You are a ruthless, elite MAANG hiring manager.
            Analyze this candidate's relevant exerience against the job description.
            Do not be polite. Tell them exactly what they are missing, what their weak points are, and if they actually stand a chance.
            
            CANDIDATE'S RETRIEVED EXPERIENCE:
            - ${resumeContext || "No relevant experience found in the database for this job."}
            
            JOB DESCRIPTION TO MATCH AGAINST:
            ${jobDescription}
        `;

        const { text } = await generateText({
            model: google('gemini-2.5-flash'),
            prompt: prompt,
        });

        return NextResponse.json({ analysis: text });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Analysis failed." }, { status: 500 })
    }
}