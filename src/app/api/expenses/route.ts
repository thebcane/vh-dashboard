import { NextResponse } from "next/server";
import { getSession, supabase } from "@/lib/auth";
import { cachedExpenseRepository } from "@/lib/repositories";

export async function GET() {
  try {
    // Get the current user session
    const sessionData = await getSession();

    if (!sessionData?.session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = sessionData.session;

    // Get all expenses for the user with associated projects
    const expenses = await cachedExpenseRepository.findWithProjectByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the current user session
    const sessionData = await getSession();

    if (!sessionData?.session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = sessionData.session;

    // Get expense data from request body
    const data = await request.json();
    
    // Create the expense
    const expense = await cachedExpenseRepository.create({
      title: data.title,
      description: data.description || "",
      amount: data.amount,
      date: new Date(data.date).toISOString(),
      category: data.category,
      invoiceNumber: data.invoiceNumber || null,
      paid: data.paid || false,
      userId: session.user.id,
      projectId: data.projectId || null,
    });

    // If we need project information, we can fetch it separately
    let expenseWithProject = null;
    
    if (expense.projectId) {
      const expenses = await cachedExpenseRepository.findWithProjectByUserId(session.user.id);
      expenseWithProject = expenses.find((e: { id: string }) => e.id === expense.id) || null;
    } else {
      expenseWithProject = {
        ...expense,
        project: null,
      };
    }

    return NextResponse.json({
      success: true,
      expense: expenseWithProject || expense,
    });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create expense" },
      { status: 500 }
    );
  }
}