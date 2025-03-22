import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { expenseRepository, ExpenseWithProject } from "@/lib/repositories/expense-repository";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user session
    const { session } = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenseId = params.id;

    // Get the expense
    const expense = await expenseRepository.findById(expenseId);

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

    // Get the expense with project information
    const expensesWithProject = await expenseRepository.findWithProjectByUserId(session.user.id);
    const expenseWithProject = expensesWithProject.find(e => e.id === expenseId);

    return NextResponse.json({
      success: true,
      expense: expenseWithProject || { ...expense, project: null },
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
    const { session } = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenseId = params.id;
    const data = await request.json();

    // Check if the expense exists
    const existingExpense = await expenseRepository.findById(expenseId);

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    // Check if the expense belongs to the current user
    if (existingExpense.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Prepare update values
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = new Date(data.date).toISOString();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber;
    if (data.paid !== undefined) updateData.paid = data.paid;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;

    // Update the expense
    const updatedExpense = await expenseRepository.update(expenseId, updateData);

    // Get the updated expense with project information
    let expenseWithProject: ExpenseWithProject | null = null;
    
    if (updatedExpense.projectId) {
      const expensesWithProject = await expenseRepository.findWithProjectByUserId(session.user.id);
      expenseWithProject = expensesWithProject.find(e => e.id === expenseId) || null;
    } else {
      expenseWithProject = {
        ...updatedExpense,
        project: null
      };
    }

    return NextResponse.json({
      success: true,
      expense: expenseWithProject || updatedExpense,
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
    const { session } = await getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const expenseId = params.id;

    // Check if the expense exists
    const existingExpense = await expenseRepository.findById(expenseId);

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    // Check if the expense belongs to the current user
    if (existingExpense.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the expense
    await expenseRepository.delete(expenseId);

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