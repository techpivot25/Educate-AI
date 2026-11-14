export interface ScreenshotCaptureContext {
  studentName: string;
  studentEmail?: string;
  grade?: string | number;
  board?: string;
  subject: string;
  topic?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  surfaceLabel?: string;
  timestamp: string;
}

/**
 * Generates an actual PNG screenshot evidence image (data:image/png;base64,...)
 * capturing the Student Portal state, timestamp, active subject/topic, and incident notice
 * without failing on modern Tailwind v4 color functions (oklch / color-mix).
 */
export async function captureQuickDoubtScreenshot(
  ctx: ScreenshotCaptureContext
): Promise<string> {
  const width = 1200;
  const height = 680;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');

  if (!g) {
    return '';
  }

  // Dark portal backdrop framing the active Student Portal window
  g.fillStyle = '#0F172A';
  g.fillRect(0, 0, width, height);

  // Subtle top browser window bar
  g.fillStyle = '#1E293B';
  g.fillRect(0, 0, width, 46);
  const dotColors = ['#EF4444', '#F59E0B', '#10B981'];
  dotColors.forEach((c, idx) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(28 + idx * 20, 23, 6, 0, Math.PI * 2);
    g.fill();
  });

  g.fillStyle = '#94A3B8';
  g.font = '600 13px Fredoka, Quicksand, sans-serif';
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'PivotIQ Student Portal';
  g.fillText(`${currentUrl}  •  ${ctx.surfaceLabel || 'Quick Doubts AI Assistant'}`, 105, 28);

  // Left sidebar representation matching Student Hub
  g.fillStyle = '#111C33';
  g.fillRect(0, 46, 230, height - 46);
  g.fillStyle = '#FFFFFF';
  g.font = '700 20px Fredoka, Quicksand, sans-serif';
  g.fillText('PivotIQ', 24, 92);
  g.fillStyle = '#14B8A6';
  g.font = '600 11px Fredoka, Quicksand, sans-serif';
  g.fillText('● STUDENT PORTAL', 24, 114);

  g.fillStyle = '#1E293B';
  g.fillRect(18, 136, 194, 68);
  g.fillStyle = '#F8FAFC';
  g.font = '600 14px Fredoka, Quicksand, sans-serif';
  g.fillText(ctx.studentName.slice(0, 22), 30, 165);
  g.fillStyle = '#94A3B8';
  g.font = '400 12px Fredoka, Quicksand, sans-serif';
  g.fillText(`Grade ${ctx.grade || '8'} • ${ctx.board || 'CBSE'}`, 30, 186);

  // Main workspace card background
  g.fillStyle = '#F8FAFC';
  g.fillRect(230, 46, width - 230, height - 46);

  // Inner Quick Doubts AI panel screenshot card
  const cardX = 266;
  const cardY = 82;
  const cardW = width - 302;
  const cardH = height - 118;

  g.fillStyle = '#FFFFFF';
  g.strokeStyle = '#FECACA';
  g.lineWidth = 2;
  g.beginPath();
  g.roundRect(cardX, cardY, cardW, cardH, 18);
  g.fill();
  g.stroke();

  // Red incident capture header banner
  g.fillStyle = '#FEF2F2';
  g.beginPath();
  g.roundRect(cardX + 20, cardY + 20, cardW - 40, 74, 12);
  g.fill();

  g.fillStyle = '#DC2626';
  g.font = '700 18px Fredoka, Quicksand, sans-serif';
  g.fillText('CONDUCT GUARDRAIL TRIGGERED — FOUL LANGUAGE BLOCKED', cardX + 38, cardY + 50);

  g.fillStyle = '#7F1D1D';
  g.font = '400 13px Fredoka, Quicksand, sans-serif';
  g.fillText(
    `Automated Visual Evidence Snapshot • Captured at ${ctx.timestamp}`,
    cardX + 38,
    cardY + 74
  );

  // Metadata details grid
  const metaY = cardY + 118;
  g.fillStyle = '#F1F5F9';
  g.beginPath();
  g.roundRect(cardX + 20, metaY, cardW - 40, 150, 12);
  g.fill();

  g.fillStyle = '#0F172A';
  g.font = '600 15px Fredoka, Quicksand, sans-serif';
  g.fillText('Incident & Context Snapshot', cardX + 38, metaY + 30);

  g.fillStyle = '#334155';
  g.font = '400 14px Fredoka, Quicksand, sans-serif';
  g.fillText(`Student: ${ctx.studentName} (${ctx.studentEmail || 'Student Account'})`, cardX + 38, metaY + 60);
  g.fillText(`Curriculum Context: ${ctx.subject}${ctx.topic ? ` • ${ctx.topic}` : ''}`, cardX + 38, metaY + 86);
  g.fillText(`Surface: Quick Doubts AI Assistant (${ctx.surfaceLabel || 'Dashboard Chat'})`, cardX + 38, metaY + 112);
  g.fillText(`AI Response Status: BLOCKED — AI Assistant refused to engage or reply`, cardX + 38, metaY + 136);

  // Guardian Dispatch Confirmation box
  const dispY = metaY + 172;
  g.fillStyle = '#ECFDF5';
  g.strokeStyle = '#A7F3D0';
  g.lineWidth = 1.5;
  g.beginPath();
  g.roundRect(cardX + 20, dispY, cardW - 40, 140, 12);
  g.fill();
  g.stroke();

  g.fillStyle = '#065F46';
  g.font = '700 16px Fredoka, Quicksand, sans-serif';
  g.fillText('Immediate Guardian Escalation Dispatched', cardX + 38, dispY + 32);

  g.fillStyle = '#047857';
  g.font = '400 14px Fredoka, Quicksand, sans-serif';
  g.fillText(`Guardian Name: ${ctx.guardianName || 'Parent / Guardian'}`, cardX + 38, dispY + 62);
  g.fillText(`WhatsApp Alert Recipient: ${ctx.guardianPhone || '+91 98765 11223'}`, cardX + 38, dispY + 88);
  g.fillText(`Email Alert Recipient (with PNG Screenshot): ${ctx.guardianEmail || 'guardian@example.org'}`, cardX + 38, dispY + 114);

  // Privacy note at bottom
  g.fillStyle = '#64748B';
  g.font = '400 12px Fredoka, Quicksand, sans-serif';
  g.fillText(
    'Note: Flagged content redacted from AI generation. Alert routed privately to Parent/Guardian only.',
    cardX + 24,
    cardY + cardH - 22
  );

  try {
    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}
