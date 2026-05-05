import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import type { ChatRequestBody, ChatResponseBody, ProposedAction } from "@/lib/chat-types";

const KNOWLEDGE_BASE = `
### FAQ

Q: How do I submit a maintenance request?
A: Go to the 'Requests' section and click 'New Request'. Fill in the form by selecting the category, priority, and describing the problem in detail. You can also attach a photo. Or ask me and I can create one for you directly in this chat.

Q: What should I do in case of emergency?
A: For emergencies (flooding, dangerous electrical faults, etc.) immediately call the 24/7 emergency maintenance number: +39 041 5xxx xxx. Do NOT use the app or this chat for emergencies.

Q: How long does it take to resolve a request?
A: Times vary based on priority and complexity. Urgent requests are handled within 24 hours. Normal requests are typically resolved within 3-5 business days.

Q: Can I cancel a submitted request?
A: Currently, it's not possible to cancel a submitted request. If you made an error, contact the staff through the contacts in the appropriate section.

Q: How do priorities work?
A: Low: cosmetic or non-urgent issues. Medium: issues that don't prevent room usage. High: issues that significantly limit room usage. Urgent: emergencies making the room uninhabitable.

Q: Can I see my roommate's requests?
A: In the 'My Room' section, you can see all active requests related to your room, including those from your roommate.

Q: Who handles my requests?
A: Requests are managed by the H-Farm Campus accommodation maintenance team. You'll receive notifications when your request status changes.

Q: What are the staff working hours?
A: Staff is available Monday to Friday, 9:00 AM to 6:00 PM. For after-hours emergencies, use the 24/7 emergency maintenance number.

Q: What do I do if I get a new roommate?
A: Contact the reception to update room data. The new roommate will need to register on the app with their own details.

Q: How do I modify my profile?
A: Currently, the profile is read-only after registration. For changes, contact the accommodation staff.

### Rules & Regulations

Quiet Hours: Quiet hours are from 10:00 PM to 8:00 AM every day. During these hours, maintaining a respectful noise level is mandatory. Loud music, parties, and noisy activities are not allowed.

Guest Policy: Guests must be registered at the reception. Maximum allowed stay is 2 consecutive nights. Each student is responsible for their guests' behaviour. Guests cannot use common areas without the resident's presence.

Common Areas: Kitchen: clean after each use, don't leave expired food in the fridge. Laundry: respect turns, remove clothes as soon as the cycle ends. Study room: maintain silence, don't consume food.

Room Maintenance: Students are responsible for routine cleaning of their room. Damage caused by negligence will be charged to the student. Report any issues promptly through the H-OUSING app.

Safety Regulations: Familiarise yourself with emergency exits and fire extinguisher locations. Never block emergency exits. In case of fire, evacuate immediately and call 115.

Waste Separation: Waste separation is mandatory. Containers are available on each floor. Paper, plastic, glass, organic, and general waste must be separated correctly.

Prohibited Items: It is forbidden to: use candles or open flames, keep pets, make structural modifications to the room, smoke inside buildings, use unauthorised high-consumption electrical appliances.

### Emergency Contacts

- Emergency Maintenance 24/7: +39 041 5xxx xxx
- H-Farm Campus Reception (Mon-Fri 9:00 AM – 6:00 PM): +39 041 5xxx xxx
- General Email: accommodation@h-farm.com
- Medical Emergency: 118
- Campus Security (Internal): Extension 100
`;

const STATIC_SYSTEM_PROMPT = `You are an AI assistant for H-OUSING, the campus accommodation app at H-Farm Campus Marina, Venice.

## Your Identity
You are a helpful, friendly assistant for students living at H-Farm Campus Marina accommodation.
Respond in the same language the student uses. Default to Italian unless they write in English.
Keep responses concise and conversational — this is a mobile chat interface.

## What You Can Do
1. Answer questions about the accommodation using the knowledge base below.
2. Help students manage their maintenance requests:
   - Create a new maintenance request
   - Update the status of an existing request (only the ones listed in the user context)
   - Mark a request as complete/resolved
   When you decide to take one of these actions, call the propose_maintenance_action tool.
   NEVER call this tool unless the student has clearly asked you to perform an action.
   Write a brief summary of what you're about to do BEFORE calling the tool.

## Important Rules
- For emergencies (flooding, dangerous electrical faults, fire), always advise calling +39 041 5xxx xxx immediately. Do not create a maintenance request for emergencies.
- Students can only update their OWN requests (the ones listed in the user context). If asked to update a request not in the list, politely refuse.
- Never invent information not present in the knowledge base below.
- Descriptions for new requests must be at least 20 characters and descriptive.

---
## Knowledge Base
${KNOWLEDGE_BASE}`;

function buildUserContextPrompt(ctx: ChatRequestBody["userContext"]): string {
  const requestsList =
    ctx.activeRequests.length > 0
      ? ctx.activeRequests
          .map(
            (r) =>
              `  - ID: ${r.id} | ${r.category} | ${r.priority} priority | status: ${r.status} | "${r.description.slice(0, 80)}"`
          )
          .join("\n")
      : "  None";

  return `## User Context
- Name: ${ctx.name}
- Room: ${ctx.roomNumber ?? "not assigned"}, Building ${ctx.building ?? "unknown"}
- Active maintenance requests (${ctx.activeRequests.length}):
${requestsList}`;
}

const tools: Anthropic.Tool[] = [
  {
    name: "propose_maintenance_action",
    description:
      "Propose a maintenance request action to the user for confirmation. Only call this when the student has explicitly asked to create, update, or complete a maintenance request. The student will see a confirmation card before any action is executed.",
    input_schema: {
      type: "object" as const,
      properties: {
        actionType: {
          type: "string",
          enum: ["create", "update", "complete"],
          description: "The type of action to perform",
        },
        category: {
          type: "string",
          enum: ["plumbing", "electrical", "cleaning", "boiler", "other"],
          description: "Required for actionType=create",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "Required for actionType=create",
        },
        description: {
          type: "string",
          description:
            "Required for actionType=create. Must be at least 20 characters and clearly describe the problem.",
        },
        requestId: {
          type: "string",
          description:
            "Required for actionType=update or complete. Must be one of the user's active request IDs listed in the context.",
        },
        newStatus: {
          type: "string",
          enum: ["open", "in_progress", "completed", "rejected"],
          description: "Required for actionType=update.",
        },
        rejectionReason: {
          type: "string",
          description: "Optional for actionType=update when newStatus=rejected.",
        },
        summary: {
          type: "string",
          description:
            "A one-sentence human-readable summary of the proposed action shown in the confirmation card. Example: 'Create an urgent plumbing request about a leaking pipe in the bathroom.'",
        },
      },
      required: ["actionType", "summary"],
    },
  },
];

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    console.error("[chat/route] Unauthorized – no Clerk userId");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[chat/route] ANTHROPIC_API_KEY is missing – restart the dev server after adding it to .env.local");
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages, userMessage, userContext } = body;

  const anthropicMessages: Anthropic.MessageParam[] = [
    ...messages.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: STATIC_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: buildUserContextPrompt(userContext),
        },
      ],
      messages: anthropicMessages,
      tools,
    });

    let textContent = "";
    let pendingAction: ProposedAction | undefined;

    for (const block of response.content) {
      if (block.type === "text") {
        textContent += block.text;
      }
      if (block.type === "tool_use" && block.name === "propose_maintenance_action") {
        pendingAction = block.input as ProposedAction;
      }
    }

    return Response.json({ text: textContent, pendingAction } satisfies ChatResponseBody);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[chat/route] Anthropic error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
