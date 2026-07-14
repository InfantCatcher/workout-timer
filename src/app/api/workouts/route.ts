import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ExerciseItem } from '@/lib/types';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ plans: [] });
    }

    const plans = await prisma.workoutPlan.findMany({
      where: { userId: user.id },
      include: { exercises: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to load workout plans' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { title, description, interExerciseRest, exercises } = await req.json();

    if (!title || !exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json({ error: 'Title and at least one exercise are required' }, { status: 400 });
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        userId: user ? user.id : null,
        title,
        description,
        interExerciseRest: interExerciseRest || 30,
        exercises: {
          create: exercises.map((ex: ExerciseItem, idx: number) => ({
            name: ex.name,
            sets: Number(ex.sets) || 1,
            workSeconds: Number(ex.workSeconds) || 30,
            restSeconds: Number(ex.restSeconds) || 15,
            orderIndex: idx,
          })),
        },
      },
      include: { exercises: true },
    });

    return NextResponse.json({ plan, message: 'Workout plan saved successfully' });
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return NextResponse.json({ error: 'Failed to save workout plan' }, { status: 500 });
  }
}
