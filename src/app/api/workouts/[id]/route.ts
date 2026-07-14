import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ExerciseItem } from '@/lib/types';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const plan = await prisma.workoutPlan.findUnique({
      where: { id: params.id },
      include: { exercises: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const { title, description, interExerciseRest, exercises } = await req.json();

    const existingPlan = await prisma.workoutPlan.findUnique({
      where: { id: params.id },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    if (user && existingPlan.userId && existingPlan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to update this plan' }, { status: 403 });
    }

    // Delete existing exercises and recreate new exercise list for atomic update
    await prisma.exercise.deleteMany({
      where: { workoutPlanId: params.id },
    });

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id: params.id },
      data: {
        title,
        description,
        interExerciseRest: Number(interExerciseRest) || 30,
        exercises: {
          create: (exercises || []).map((ex: ExerciseItem, idx: number) => ({
            name: ex.name,
            sets: Number(ex.sets) || 1,
            workSeconds: Number(ex.workSeconds) || 30,
            restSeconds: Number(ex.restSeconds) || 15,
            orderIndex: idx,
          })),
        },
      },
      include: { exercises: { orderBy: { orderIndex: 'asc' } } },
    });

    return NextResponse.json({ plan: updatedPlan, message: 'Workout plan updated successfully' });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();

    const existingPlan = await prisma.workoutPlan.findUnique({
      where: { id: params.id },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 });
    }

    if (user && existingPlan.userId && existingPlan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this plan' }, { status: 403 });
    }

    await prisma.workoutPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}
