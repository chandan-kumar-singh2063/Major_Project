export async function POST(req: Request) {
  try {
    console.log("🚀 Payment initiation started...");

    // Check if Khalti secret key is available
    if (!process.env.KHALTI_SECRET_KEY) {
      console.error("❌ KHALTI_SECRET_KEY environment variable is missing");
      return new Response(
        JSON.stringify({ error: "KHALTI_SECRET_KEY is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("📥 Request body:", body);

    // Validate required fields
    if (!body.name || !body.amount) {
      console.error("❌ Missing required fields:", {
        name: !!body.name,
        amount: !!body.amount,
      });
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, amount, or to_user" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🌐 Calling Khalti API...");
    // Use return_url from body if provided, else fallback to payment-success page
    const return_url = body.return_url || `${import.meta.env.VITE_SITE_URL || "http://localhost:5173"}/payment-success`;

    const website_url =
      body.website_url || import.meta.env.VITE_SITE_URL || "http://localhost:5173";
    
    const res = await fetch(
      "https://dev.khalti.com/api/v2/epayment/initiate/",
      {
        method: "POST",
        headers: {
          Authorization: `key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url,
          website_url,
          amount: body.amount,
          purchase_order_id: `order-${Date.now()}`,
          purchase_order_name: "Donation",
          customer_info: {
            name: 'nigam',
            email: body.email || "guest@example.com",
            phone: "9800000000",
          },
        }),
      }
    );

    console.log("📥 Khalti response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Khalti API error:", errorText);
      return new Response(
        JSON.stringify({ error: `Khalti API error: ${res.status} - ${errorText}` }),
        { status: res.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    console.log("📥 Khalti response data:", data);

    if (!data.pidx) {
      console.error("❌ Payment initiation failed:", data);
      return new Response(
        JSON.stringify({ error: "Failed to initiate payment - no pidx returned" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Payment initiation successful");
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("❌ Server Error:", err);
    
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    
    return new Response(
      JSON.stringify({ error: `Server error: ${errorMessage}` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}