import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/store';
import { Project } from '@/lib/types';
import { AiGateway } from '@/lib/gateway';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = DataStore.getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = DataStore.getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();

    // Check if user requested AI Build Plan Generation via Gateway
    if (body.action === 'generate_build_plan') {
      const prompt = `Generate a rigorous, security-first technical build and implementation plan for the following project:
Project Title: ${project.title}
Description: ${project.description}
Problem Context: ${project.originalProblem?.body || 'Developer productivity and security optimization'}
Target Stack: ${project.techStack.join(', ')}

Return a structured plan with:
1. Executive Architecture Summary
2. Threat Model & Security Boundaries
3. Phased Implementation Roadmap with 3 distinct milestones and tasks per milestone.`;

      const gatewayRes = await AiGateway.generate({
        prompt,
        systemPrompt: "You are the DEVFORGE Lead Architect. Deliver production-grade implementation plans emphasizing security, zero-trust boundaries, and performance.",
        provider: body.provider || 'auto',
        effort: body.effort || 'high',
        userKeys: body.userKeys
      });

      const updatedProject: Project = {
        ...project,
        stage: 'in_progress',
        updatedAt: new Date().toISOString(),
        buildPlan: {
          summary: `Implementation Specification for ${project.title}`,
          architectureNotes: gatewayRes.content,
          gatewayMetadata: {
            provider: gatewayRes.provider,
            model: gatewayRes.model,
            latencyMs: gatewayRes.latencyMs
          },
          phases: [
            {
              title: "Milestone 1: Core Primitives & Contract Validation",
              tasks: [
                "Establish strict Zod input schemas and edge headers",
                "Set up local unit test suites with security mocking",
                "Configure automated OSV dependency gating"
              ],
              status: "completed"
            },
            {
              title: "Milestone 2: Middleware & Business Logic",
              tasks: [
                "Implement primary business engine with retry logic",
                "Enforce rate limits and CORS security policies",
                "Integrate telemetry and error boundary handlers"
              ],
              status: "in_progress"
            },
            {
              title: "Milestone 3: Security Hardening & CI/CD Gating",
              tasks: [
                "Audit Dockerfile for non-root execution",
                "Sweep codebase for lingering test credentials",
                "Deploy to staging and verify end-to-end flow"
              ],
              status: "pending"
            }
          ]
        }
      };

      DataStore.saveProject(updatedProject);
      return NextResponse.json({ success: true, project: updatedProject, gatewayResponse: gatewayRes });
    }

    // Standard update
    const updated: Project = {
      ...project,
      ...body,
      id: project.id, // Immutable
      updatedAt: new Date().toISOString()
    };

    DataStore.saveProject(updated);
    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ok = DataStore.deleteProject(params.id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
