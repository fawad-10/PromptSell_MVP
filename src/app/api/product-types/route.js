import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../lib/supabase";

export async function GET(request) {
  try {
    // Get available product types using the database function
    const { data: productTypes, error } = await supabaseAdmin.rpc(
      "get_available_product_types"
    );

    if (error) {
      console.error("Error fetching product types:", error);
      return NextResponse.json(
        { error: "Failed to fetch product types" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      productTypes: productTypes || [],
    });
  } catch (error) {
    console.error("Error in product-types API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      name,
      displayName,
      description,
      category = "custom",
    } = await request.json();

    // Validate required fields
    if (!name || !displayName) {
      return NextResponse.json(
        { error: "Missing required fields: name, displayName" },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create Supabase client with the token
    const supabaseWithAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabaseWithAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Check if user is a seller
    const clientToUse = supabaseAdmin || supabaseWithAuth;
    const { data: profile, error: profileError } = await clientToUse
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (!["seller", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Only sellers and admins can create product types" },
        { status: 403 }
      );
    }

    // Create the product type
    const { data: productTypeId, error: createError } = await clientToUse.rpc(
      "get_or_create_product_type",
      {
        type_name: name,
        type_display_name: displayName,
        type_description: description,
        type_category: category,
        creator_id: user.id,
      }
    );

    if (createError) {
      console.error("Error creating product type:", createError);
      return NextResponse.json(
        { error: "Failed to create product type" },
        { status: 500 }
      );
    }

    // Get the created product type details
    const { data: newProductType, error: fetchError } = await clientToUse
      .from("product_types")
      .select("*")
      .eq("id", productTypeId)
      .single();

    if (fetchError) {
      console.error("Error fetching created product type:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch created product type" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product type created successfully",
      productType: newProductType,
    });
  } catch (error) {
    console.error("Error in create product type API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
