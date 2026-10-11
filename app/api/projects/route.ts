import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/store';
import { Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = DataStore.getProjects();
    return NextResponse.json({
      success: true,
      projects
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, originalProblem, techStack, tags, repositoryUrl } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required." },
        { status: 400 }
      );
    }

    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const newProject: Project = {
      id,
      title,
      slug,
      description,
      stage: originalProblem?.analysis ? 'architected' : 'discovered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      problemId: originalProblem?.id,
      originalProblem,
      techStack: techStack || (originalProblem?.analysis?.suggestedStack ? Object.values(originalProblem.analysis.suggestedStack).flat() : ['TypeScript', 'Next.js']),
      repositoryUrl: repositoryUrl || '',
      tags: tags || ['Security', 'Full-Stack'],
      buildPlan: originalProblem?.analysis ? {
        summary: `Architecture Plan for ${title}`,
        architectureNotes: originalProblem.analysis.rootCause,
        gatewayMetadata: {
          provider: originalProblem.analysis.providerUsed,
          model: originalProblem.analysis.modelUsed,
          latencyMs: 450
        },
        phases: originalProblem.analysis.implementationPhases.map((p: any) => ({
          title: p.phase,
          tasks: p.deliverables,
          status: 'pending' as const
        }))
      } : undefined
    };

    DataStore.saveProject(newProject);

    return NextResponse.json({
      success: true,
      project: newProject
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
