import { createClient } from "@supabase/supabase-js";
import { generateWithGemini } from "../../../lib/gemini";
import { checkAdminAccess } from "../../../lib/premium";

// Helper functions for generating smart defaults
function extractMainKeyword(topic) {
  // Extract potential main keyword from topic
  const words = topic.toLowerCase().split(" ");
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "best",
    "how",
    "why",
    "what",
    "when",
    "where",
  ];
  const meaningfulWords = words.filter(
    (word) =>
      word.length > 2 && !stopWords.includes(word) && !word.match(/^\d+$/)
  );

  // Return the most relevant words (up to 3) as main keyword
  return (
    meaningfulWords.slice(0, 2).join(" ") ||
    topic.split(" ").slice(0, 2).join(" ")
  );
}

function generateSecondaryKeywords(topic) {
  // Generate related keywords based on topic
  const words = topic.toLowerCase().split(" ");
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ];
  const meaningfulWords = words.filter(
    (word) => word.length > 2 && !stopWords.includes(word)
  );

  // Create variations and combinations
  const variations = [];
  meaningfulWords.forEach((word) => {
    variations.push(word + "s"); // plural
    variations.push(word + " tips");
    variations.push(word + " guide");
    variations.push("best " + word);
  });

  return (
    variations.slice(0, 5).join(", ") ||
    topic + " tips, " + topic + " guide, best " + topic
  );
}

// POST: Generate a prompt using hidden templates
export async function POST(req) {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the user token for auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY
    );

    // Create a service role client for accessing templates (bypasses RLS)
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY // For now, using the same key
    );

    // Get user from token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    const { type, topic, mainKeyword, secondaryKeywords, brandVoice } =
      await req.json();

    console.log("Generation request:", { type, topic });

    if (!type || !topic) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user owns this prompt type using our database function
    const { data: hasAccess, error: ownershipError } = await supabase.rpc(
      "user_owns_prompt",
      {
        user_uuid: user.id,
        prompt_type: type,
      }
    );

    // Get user's role to check if they're admin (for response messages)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";

    if (ownershipError) {
      console.error("Error checking prompt ownership:", ownershipError);
      return Response.json(
        { error: "Failed to verify prompt ownership" },
        { status: 500 }
      );
    }

    if (!hasAccess) {
      return Response.json(
        {
          error: "Prompt not purchased",
          message: `Please purchase the ${type.replace(
            "_",
            " "
          )} template to generate content`,
          requiresPurchase: true,
          promptType: type,
        },
        { status: 403 }
      );
    }

    // Fetch the prompt template using service client (bypasses RLS)
    const { data: template, error } = await supabaseService
      .from("prompt_templates")
      .select("*")
      .eq("type", type)
      .single();

    console.log("Template fetch result:", {
      type,
      template: template?.title,
      error,
    });

    if (error || !template) {
      return Response.json({ error: "Template not found" }, { status: 404 });
    }

    // Note: For generation purposes, we allow access to admin-only templates
    // The RLS policies on the database level still protect the templates from direct access
    // This allows users to generate content using the premium templates

    // Generate smart defaults for missing fields
    const smartMainKeyword = mainKeyword || extractMainKeyword(topic);
    const smartSecondaryKeywords =
      secondaryKeywords || generateSecondaryKeywords(topic);
    const smartBrandVoice = brandVoice || "professional";

    // Generate the customized prompt template
    let promptTemplate = template.template
      .replace(/\[INSERT YOUR TOPIC\/NICHE HERE\]/g, topic)
      .replace(/\[INSERT MAIN KEYWORD HERE\]/g, smartMainKeyword)
      .replace(/\[INSERT SECONDARY KEYWORDS\]/g, smartSecondaryKeywords)
      .replace(
        /\[INSERT BRAND VOICE: friendly, professional, witty, etc.\]/g,
        smartBrandVoice
      );

    // Use Gemini AI to generate the final content
    try {
      const generatedContent = await generateWithGemini(promptTemplate, {
        temperature: 0.8,
        maxTokens: 2048,
      });

      return Response.json({
        success: true,
        prompt: generatedContent,
        template_title: template.title,
      });
    } catch (geminiError) {
      console.error(
        "Gemini generation failed, returning template:",
        geminiError
      );
      // Fallback to template if Gemini fails
      return Response.json({
        success: true,
        prompt: promptTemplate,
        template_title: template.title + " (Template)",
      });
    }
  } catch (error) {
    console.error("Error generating prompt:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
