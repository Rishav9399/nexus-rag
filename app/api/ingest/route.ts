import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Initialize the bridge to your Mumbai vault.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        // 2. Read the raw text sent from your browser
        const {text, source} = await req.json();

        if(!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        // 3. Translate the text into 3,072 dimensions using Gooogle's embedding model
        const { embedding } = await embed({
            model: google.textEmbeddingModel('embedding-001'),
            value: text,
        });

        // 4. Physically burn the text and the math into database
        const { error } = await supabase.from('documents').insert({
            content: text,
            metadata: { source: source }, // Tags it as either "resume" or "job-description"
        });

        if (error) throw error;

        return NextResponse.json({
            status: "Success",
            message: "Data permanently burned into neural core."
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Ingestion failed." }, {status: 500});
    }
}