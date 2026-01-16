import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Simulate saving the file (replace with actual logic)
  console.log(`Received file: ${file.name}`);

  return NextResponse.json({ message: "File uploaded successfully", fileName: file.name });
}
