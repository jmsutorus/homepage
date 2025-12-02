import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTaskTemplates,
  createTaskTemplate,
  type CreateTaskTemplateInput,
} from "@/lib/db/task-templates";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await getTaskTemplates(session.user.id);
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching task templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch task templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const input: CreateTaskTemplateInput = {
      name: body.name,
      title: body.title,
      priority: body.priority,
      category: body.category,
      dueDate: body.dueDate,
    };

    const id = await createTaskTemplate(session.user.id, input);
    return NextResponse.json({ id: Number(id) }, { status: 201 });
  } catch (error) {
    console.error("Error creating task template:", error);
    return NextResponse.json(
      { error: "Failed to create task template" },
      { status: 500 }
    );
  }
}
