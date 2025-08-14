import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Conversation {
	id: string;
	title: string;
	user_id: string;
	created_at: string;
}

export interface Message {
	id: string;
	content: string;
	role: "user" | "assistant";
	conversation_id: string;
	user_id: string;
	created_at: string;
}
