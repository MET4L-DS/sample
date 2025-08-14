import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";

// Check if we have valid environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const isDevelopmentMode =
	!supabaseUrl ||
	supabaseUrl.includes("your-supabase-url") ||
	!supabaseKey ||
	supabaseKey.includes("your-supabase") ||
	!geminiKey ||
	geminiKey.includes("your-google-gemini");

// Log environment status for debugging
if (isDevelopmentMode) {
	console.log("🔧 Running in DEVELOPMENT MODE with mock data");
	console.log(
		"📝 To enable production mode, configure these environment variables:"
	);
	console.log("   - NEXT_PUBLIC_SUPABASE_URL");
	console.log("   - SUPABASE_SERVICE_ROLE_KEY");
	console.log("   - GOOGLE_GENERATIVE_AI_API_KEY");
} else {
	console.log("🚀 Running in PRODUCTION MODE with real services");
	console.log("✅ Supabase URL configured");
	console.log("✅ Supabase Service Key configured");
	console.log("✅ Google Gemini API Key configured");
}

// Initialize Supabase only if we have valid credentials
let supabase: any = null;
if (!isDevelopmentMode) {
	supabase = createClient(supabaseUrl!, supabaseKey!);
}

// Initialize Google Gemini AI only if we have valid credentials
let genAI: any = null;
if (!isDevelopmentMode) {
	genAI = new GoogleGenerativeAI(geminiKey!);
}

// Create tRPC instance
const t = initTRPC.create({
	transformer: superjson,
});

// Create router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Helper function to handle Gemini API calls with retry logic
async function callGeminiWithRetry(
	genAI: any,
	prompt: string,
	maxRetries: number = 3,
	baseDelay: number = 1000
): Promise<string> {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const model = genAI.getGenerativeModel({
				model: "gemini-1.5-flash",
			});
			const result = await model.generateContent(prompt);
			return result.response.text();
		} catch (error: any) {
			console.error(
				`Gemini API attempt ${attempt}/${maxRetries} failed:`,
				error
			);

			// Check if it's a 503 (service overloaded) or rate limit error
			if (error.status === 503 || error.status === 429) {
				if (attempt < maxRetries) {
					const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
					console.log(`Retrying in ${delay}ms...`);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}
			}

			// If it's the last attempt or a non-retryable error, throw
			if (attempt === maxRetries) {
				throw error;
			}
		}
	}
	throw new Error("Max retries exceeded");
}

// Fallback responses when AI is unavailable
function getFallbackResponse(
	prompt: string,
	isImageRequest: boolean = false
): string {
	if (isImageRequest) {
		return `🎨 Image Request: "${prompt}"\n\nI'd love to help with image generation, but the AI service is currently unavailable. This would create a visual representation of your request. Please try again in a few minutes when the service is back online.`;
	}

	const fallbackResponses = [
		`I received your message: "${prompt}"\n\nI'm currently unable to connect to the AI service, but I wanted to acknowledge your message. Please try again in a few moments when the service is available.`,
		`Thank you for your message about "${prompt}". The AI service is temporarily unavailable, but I'll be ready to help as soon as it's back online.`,
		`I see you're asking about "${prompt}". Unfortunately, I can't process this right now due to service issues, but please don't hesitate to try again shortly.`,
	];

	return fallbackResponses[
		Math.floor(Math.random() * fallbackResponses.length)
	];
}

// For now, we'll use a mock user ID - in production, this would come from authentication
const MOCK_USER_ID = "demo-user-123";

// Mock data for development
const mockConversations = [
	{
		id: "550e8400-e29b-41d4-a716-446655440000", // Proper UUID format
		title: "Welcome Chat",
		user_id: MOCK_USER_ID,
		created_at: new Date().toISOString(),
	},
	{
		id: "550e8400-e29b-41d4-a716-446655440001", // Proper UUID format
		title: "AI Assistant Help",
		user_id: MOCK_USER_ID,
		created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
	},
];

const mockMessages = [
	{
		id: "550e8400-e29b-41d4-a716-446655440002", // Proper UUID format
		content:
			"Hello! Welcome to your AI assistant. How can I help you today?",
		role: "assistant" as const,
		conversation_id: "550e8400-e29b-41d4-a716-446655440000",
		user_id: MOCK_USER_ID,
		created_at: new Date().toISOString(),
	},
];

// In-memory storage for development
let conversations = [...mockConversations];
let messages: Array<{
	id: string;
	content: string;
	role: "user" | "assistant";
	conversation_id: string;
	user_id: string;
	created_at: string;
}> = [...mockMessages];

// App router
export const appRouter = router({
	// Get conversation history
	getConversations: publicProcedure.query(async () => {
		if (isDevelopmentMode) {
			// Return mock data in development
			return conversations
				.filter((conv) => conv.user_id === MOCK_USER_ID)
				.sort(
					(a, b) =>
						new Date(b.created_at).getTime() -
						new Date(a.created_at).getTime()
				);
		}

		const { data, error } = await supabase
			.from("conversations")
			.select("*")
			.eq("user_id", MOCK_USER_ID)
			.order("created_at", { ascending: false });

		if (error)
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error.message,
			});
		return data || [];
	}),

	// Get messages for a conversation
	getMessages: publicProcedure
		.input(z.object({ conversationId: z.string() }))
		.query(async ({ input }) => {
			if (isDevelopmentMode) {
				// Return mock data in development
				return messages
					.filter(
						(msg) =>
							msg.conversation_id === input.conversationId &&
							msg.user_id === MOCK_USER_ID
					)
					.sort(
						(a, b) =>
							new Date(a.created_at).getTime() -
							new Date(b.created_at).getTime()
					);
			}

			const { data, error } = await supabase
				.from("messages")
				.select("*")
				.eq("conversation_id", input.conversationId)
				.eq("user_id", MOCK_USER_ID)
				.order("created_at", { ascending: true });

			if (error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message,
				});
			return data || [];
		}),

	// Create new conversation
	createConversation: publicProcedure
		.input(z.object({ title: z.string() }))
		.mutation(async ({ input }) => {
			if (isDevelopmentMode) {
				// Create mock conversation in development
				const newConversation = {
					id: uuidv4(), // Use proper UUID instead of timestamp string
					title: input.title,
					user_id: MOCK_USER_ID,
					created_at: new Date().toISOString(),
				};
				conversations.push(newConversation);
				return newConversation;
			}

			const { data, error } = await supabase
				.from("conversations")
				.insert({
					title: input.title,
					user_id: MOCK_USER_ID,
					created_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message,
				});
			return data;
		}),

	// Send message and get AI response
	sendMessage: publicProcedure
		.input(
			z.object({
				content: z.string(),
				conversationId: z.string(),
				modelType: z.enum(["text", "image"]),
			})
		)
		.mutation(async ({ input }) => {
			// Save user message
			const userMessage = {
				id: uuidv4(), // Use proper UUID instead of timestamp string
				content: input.content,
				role: "user" as const,
				conversation_id: input.conversationId,
				user_id: MOCK_USER_ID,
				created_at: new Date().toISOString(),
			};

			if (isDevelopmentMode) {
				// Add to mock storage
				messages.push(userMessage);
			} else {
				const { data: savedUserMessage, error: userError } =
					await supabase
						.from("messages")
						.insert(userMessage)
						.select()
						.single();

				if (userError)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: userError.message,
					});
			}

			// Generate AI response
			let aiResponse = "";
			try {
				if (isDevelopmentMode) {
					// Mock AI responses for development
					if (input.modelType === "text") {
						const responses = [
							"I'm a demo AI assistant! Your message was: '" +
								input.content +
								"'. In a real setup, this would be powered by Google Gemini AI.",
							"Thanks for your message! I'm currently running in demo mode. To get real AI responses, please set up your Google Gemini API key.",
							"Hello! I'm here to help. This is a mock response - configure your environment variables to enable real AI chat.",
						];
						aiResponse =
							responses[
								Math.floor(Math.random() * responses.length)
							];
					} else {
						aiResponse = `Image generation request: "${input.content}"\n\n🎨 In demo mode, I can only describe what the image might look like:\n\nThis would be a creative visual representation of "${input.content}" with vibrant colors and artistic details. To enable actual image generation, please configure your Google Gemini API key.`;
					}
				} else {
					if (input.modelType === "text") {
						aiResponse = await callGeminiWithRetry(
							genAI,
							input.content
						);
					} else {
						// For image generation, we'll use text model to generate a descriptive response
						const imagePrompt = `Generate a detailed description for an image based on this request: ${input.content}`;
						const description = await callGeminiWithRetry(
							genAI,
							imagePrompt
						);
						aiResponse = `Image description: ${description}\n\n[Note: In a full implementation, this would generate an actual image using Gemini's image generation capabilities]`;
					}
				}
			} catch (error: any) {
				console.error("AI Generation Error:", error);

				// Provide specific error messages based on the error type
				if (error.status === 503) {
					aiResponse = getFallbackResponse(
						input.content,
						input.modelType === "image"
					);
				} else if (error.status === 429) {
					aiResponse =
						"⏱️ Rate limit exceeded. Please wait a moment before sending another message.";
				} else if (error.status === 400) {
					aiResponse =
						"❌ Invalid request. Please check your message and try again.";
				} else if (error.status === 401 || error.status === 403) {
					aiResponse =
						"🔑 API authentication error. Please check your API key configuration.";
				} else if (error.message?.includes("SAFETY")) {
					aiResponse =
						"⚠️ Your message was flagged by content safety filters. Please try rephrasing your question.";
				} else if (
					error.message?.includes("network") ||
					error.message?.includes("fetch")
				) {
					aiResponse =
						"🌐 Network connection error. Please check your internet connection and try again.";
				} else {
					// Use fallback response for any other errors
					aiResponse = getFallbackResponse(
						input.content,
						input.modelType === "image"
					);
				}
			}

			// Save AI response
			const assistantMessage = {
				id: uuidv4(), // Use proper UUID instead of timestamp string
				content: aiResponse,
				role: "assistant" as const,
				conversation_id: input.conversationId,
				user_id: MOCK_USER_ID,
				created_at: new Date().toISOString(),
			};

			if (isDevelopmentMode) {
				// Add to mock storage
				messages.push(assistantMessage);
				return {
					userMessage,
					assistantMessage,
				};
			} else {
				const { data: savedAssistantMessage, error: assistantError } =
					await supabase
						.from("messages")
						.insert(assistantMessage)
						.select()
						.single();

				if (assistantError)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: assistantError.message,
					});

				return {
					userMessage,
					assistantMessage: savedAssistantMessage,
				};
			}
		}),

	// Delete conversation
	deleteConversation: publicProcedure
		.input(z.object({ conversationId: z.string() }))
		.mutation(async ({ input }) => {
			if (isDevelopmentMode) {
				// Delete from mock storage
				messages = messages.filter(
					(msg) => msg.conversation_id !== input.conversationId
				);
				conversations = conversations.filter(
					(conv) => conv.id !== input.conversationId
				);
				return { success: true };
			}

			// Delete messages first
			await supabase
				.from("messages")
				.delete()
				.eq("conversation_id", input.conversationId)
				.eq("user_id", MOCK_USER_ID);

			// Delete conversation
			const { error } = await supabase
				.from("conversations")
				.delete()
				.eq("id", input.conversationId)
				.eq("user_id", MOCK_USER_ID);

			if (error)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: error.message,
				});
			return { success: true };
		}),
});

export type AppRouter = typeof appRouter;
