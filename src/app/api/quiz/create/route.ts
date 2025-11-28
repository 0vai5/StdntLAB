import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuizFromMaterial } from "@/lib/gemini/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { materialId, groupId, userId } = body;

    if (!materialId) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { error: "Group ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get numeric user ID
    const { data: userData } = await supabase
      .from("Users")
      .select("id")
      .eq("user_id", authUser.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const numericUserId = userData.id;

    // Fetch material from database
    const { data: material, error: materialError } = await supabase
      .from("material")
      .select("*")
      .eq("id", materialId)
      .single();

    if (materialError || !material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Generate quiz using Gemini client
    let quizData;
    try {
      quizData = await generateQuizFromMaterial(
        material.title,
        material.content
      );
    } catch (error) {
      console.error("Error generating quiz from Gemini:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate quiz from Gemini API",
        },
        { status: 500 }
      );
    }

    // Verify group_id matches
    if (material.group_id !== groupId) {
      return NextResponse.json(
        { error: "Group ID mismatch with material" },
        { status: 400 }
      );
    }

    // Create quiz record
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        group_id: groupId,
        user_id: numericUserId,
        title: `Quiz: ${material.title}`,
      })
      .select()
      .single();

    if (quizError || !quiz) {
      console.error("Error creating quiz:", quizError);
      return NextResponse.json(
        { error: "Failed to create quiz" },
        { status: 500 }
      );
    }

    // Create quiz questions
    const quizQuestions = quizData.questions.map((q) => ({
      quiz_id: quiz.id,
      question: q.question,
      options: q.options, // JSONB array
      correct_answer: q.correct_answer,
    }));

    const { error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(quizQuestions);

    if (questionsError) {
      console.error("Error creating quiz questions:", questionsError);
      // Rollback: delete the quiz if questions failed
      await supabase.from("quizzes").delete().eq("id", quiz.id);
      return NextResponse.json(
        { error: "Failed to create quiz questions" },
        { status: 500 }
      );
    }

    // Create todo for the quiz
    const { error: todoError } = await supabase.from("Todos").insert({
      user_id: numericUserId,
      title: `Complete Quiz: ${material.title}`,
      description: `Quiz created from material "${material.title}"`,
      status: "pending",
      type: "group",
      group_id: groupId,
    });

    if (todoError) {
      console.error("Error creating todo:", todoError);
      // Don't fail the request if todo creation fails, just log it
    }

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      questionsCount: quizData.questions.length,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
