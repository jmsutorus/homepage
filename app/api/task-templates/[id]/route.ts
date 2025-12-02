import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getTaskTemplate,
  updateTaskTemplate,
  deleteTaskTemplate,
  type UpdateTaskTemplateInput,
} from "@/lib/db/task-templates";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const template = await getTaskTemplate(id, session.user.id);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching task template:", error);
    return NextResponse.json(
      { error: "Failed to fetch task template" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();
    const input: UpdateTaskTemplateInput = {
      name: body.name,
      title: body.title,
      priority: body.priority,
      category: body.category,
      dueDate: body.dueDate,
    };

    const success = await updateTaskTemplate(id, session.user.id, input);

    if (!success) {
      return NextResponse.json(
        { error: "Template not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task template:", error);
    return NextResponse.json(
      { error: "Failed to update task template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const success = await deleteTaskTemplate(id, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task template:", error);
    return NextResponse.json(
      { error: "Failed to delete task template" },
      { status: 500 }
    );
  }
}
