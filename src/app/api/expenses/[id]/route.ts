import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenseId = params.id;

    // Get the expense with the associated project
    const expense = await db.expense.findUnique({
      where: {
        id: expenseId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    // Check if the expense belongs to the current user
    if (expense.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expense" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenseId = params.id;
    const data = await request.json();

    // Check if the expense exists and belongs to the user
    const existingExpense = await db.expense.findUnique({
      where: {
        id: expenseId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    if (existingExpense.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update the expense
    const updatedExpense = await db.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        date: data.date !== undefined ? new Date(data.date) : undefined,
        category: data.category !== undefined ? data.category : undefined,
        invoiceNumber: data.invoiceNumber !== undefined ? data.invoiceNumber : undefined,
        paid: data.paid !== undefined ? data.paid : undefined,
        projectId: data.projectId !== undefined ? data.projectId : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenseId = params.id;

    // Check if the expense exists and belongs to the user
    const existingExpense = await db.expense.findUnique({
      where: {
        id: expenseId,
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    if (existingExpense.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the expense
    await db.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete expense" },
      { status: 500 }
    );
  }
}