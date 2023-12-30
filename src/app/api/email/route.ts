import { NextRequest, NextResponse } from "next/server";
import { Response } from "@/lib/responses";
import { generateEmailAuthorizationUrl } from "@/lib/auth";

async function generateRequestBody(email: string) {
  const api_key = process.env.SMTP_PROVIDER_API_KEY;
  const url = await generateEmailAuthorizationUrl(email);

  return {
    api_key,
    to: [`<${email}>`],
    sender: `tristan@simpsonresearch.ca`,
    subject: "Email Authorization",
    text_body: `Your password reset link is: ${url}\n\nThis link will expire in 10 minutes.`,
    html_body: `<p>Your password reset link is: <a href="${url}">${url}</a></p><p>This link will expire in 10 minutes.</p>`,
  };
}

export async function POST(req: NextRequest) {
  // Get the user's info from the request body
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json(Response.InvalidBody, { status: 400 });
  }

  // Send an email to the user
  const baseUrl = process.env.SMTP_PROVIDER_BASE_URL;
  const sendEndpoint = process.env.SMTP_PROVIDER_SEND_ENDPOINT;

  if (!baseUrl || !sendEndpoint) {
    return NextResponse.json(Response.InternalError, { status: 500 });
  }

  // Generate the body and send the http request
  const body = await generateRequestBody(email);
  const response = await fetch(`${baseUrl}${sendEndpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Check if the request was successful
  if (!response.ok) {
    return NextResponse.json(Response.InternalError, { status: 500 });
  }

  return NextResponse.json(Response.Success, { status: 200 });
}
