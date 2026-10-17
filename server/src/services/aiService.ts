import { GoogleGenAI } from '@google/genai';
import { getDb } from '../config/db.ts';

export interface IDiagnosisResult {
  service: string;
  serviceId?: string;
  possibleProblem: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  recommendedAction: string;
  recommendedService: string;
  estimatedCostRange: string;
  suggestedDuration: string;
}

// Fallback rule-based diagnostic engine for offline/no-key scenarios
function getFallbackDiagnosis(query: string): IDiagnosisResult {
  const q = query.toLowerCase();
  const db = getDb();

  if (q.includes('ac') || q.includes('cooling') || q.includes('air conditioner') || q.includes('compressor')) {
    const acService = db.services.find((s) => s.category === 'AC Repair') || db.services[0];
    return {
      service: 'AC Repair',
      serviceId: acService._id,
      possibleProblem: q.includes('leak') || q.includes('water')
        ? 'Clogged drain pipe or indoor unit ice buildup melt'
        : q.includes('not cooling') || q.includes('cooling')
        ? 'Refrigerant gas low or condenser coil clogged with dust'
        : 'Compressor capacitor failure or blower motor obstruction',
      priority: 'Medium',
      recommendedAction: 'Schedule on-site technician inspection, drain line flush and gas pressure check',
      recommendedService: acService.name,
      estimatedCostRange: `₹${acService.price} - ₹${acService.price + 500}`,
      suggestedDuration: `${acService.durationMinutes} mins`,
    };
  }

  if (q.includes('leak') || q.includes('tap') || q.includes('pipe') || q.includes('water') || q.includes('drain') || q.includes('plumb')) {
    const plumbService = db.services.find((s) => s.category === 'Plumbing') || db.services[4];
    return {
      service: 'Plumbing',
      serviceId: plumbService._id,
      possibleProblem: q.includes('drain') || q.includes('clog')
        ? 'Grease accumulation or debris blockage in trap pipe'
        : 'Worn-out washer or defective internal spindle valve',
      priority: q.includes('urgent') || q.includes('overflow') ? 'High' : 'Medium',
      recommendedAction: 'Turn off primary angle valve and schedule pressure snaking/repair',
      recommendedService: plumbService.name,
      estimatedCostRange: `₹${plumbService.price} - ₹${plumbService.price + 300}`,
      suggestedDuration: `${plumbService.durationMinutes} mins`,
    };
  }

  if (q.includes('spark') || q.includes('tripping') || q.includes('mcb') || q.includes('shock') || q.includes('power') || q.includes('wire')) {
    const elecService = db.services.find((s) => s.category === 'Electrical') || db.services[2];
    return {
      service: 'Electrical',
      serviceId: elecService._id,
      possibleProblem: 'Phase overload, earth leakage, or loose terminal heating',
      priority: 'High',
      recommendedAction: 'Keep sensitive appliances unplugged and request urgent electrical diagnostic',
      recommendedService: elecService.name,
      estimatedCostRange: `₹${elecService.price} - ₹${elecService.price + 400}`,
      suggestedDuration: `${elecService.durationMinutes} mins`,
    };
  }

  if (q.includes('laptop') || q.includes('screen') || q.includes('slow') || q.includes('boot') || q.includes('mac') || q.includes('computer')) {
    const pcService = db.services.find((s) => s.category === 'Laptop Repair') || db.services[6];
    return {
      service: 'Laptop Repair',
      serviceId: pcService._id,
      possibleProblem: q.includes('screen') || q.includes('display')
        ? 'Display ribbon cable wear or backlight voltage instability'
        : 'Hard drive thermal throttling, corrupt boot partition or RAM fault',
      priority: 'Medium',
      recommendedAction: 'Avoid pressing panel hinges and bring for bench diagnostics or doorstep inspection',
      recommendedService: pcService.name,
      estimatedCostRange: `₹${pcService.price} - ₹${pcService.price + 600}`,
      suggestedDuration: `${pcService.durationMinutes} mins`,
    };
  }

  if (q.includes('clean') || q.includes('pest') || q.includes('cockroach') || q.includes('bedbug') || q.includes('dust')) {
    const cleanService = db.services.find((s) => s.category === 'Cleaning') || db.services[8];
    return {
      service: 'Cleaning',
      serviceId: cleanService._id,
      possibleProblem: q.includes('pest') || q.includes('cockroach')
        ? 'Deep pest colony nesting in dark moisture pockets'
        : 'Accumulated indoor allergens, grease build-up and tile scaling',
      priority: 'Low',
      recommendedAction: 'Schedule comprehensive sanitization with herbal treatment safe for family and pets',
      recommendedService: cleanService.name,
      estimatedCostRange: `₹${cleanService.price} - ₹${cleanService.price + 500}`,
      suggestedDuration: `${cleanService.durationMinutes} mins`,
    };
  }

  // Default fallback
  const defaultService = db.services[0];
  return {
    service: defaultService.category,
    serviceId: defaultService._id,
    possibleProblem: 'General appliance wear or calibration required',
    priority: 'Medium',
    recommendedAction: 'Book a certified multi-point inspection with a verified ServiceHub expert',
    recommendedService: defaultService.name,
    estimatedCostRange: `₹${defaultService.price} - ₹${defaultService.price + 400}`,
    suggestedDuration: `${defaultService.durationMinutes} mins`,
  };
}

export async function diagnoseIssue(query: string): Promise<IDiagnosisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return getFallbackDiagnosis(query);
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
    );

    const callPromise = (async () => {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are ServiceHub AI, an expert home appliance and technical service triage assistant.
A customer reported this issue: "${query}"

Respond with ONLY a raw JSON object (no markdown, no backticks, no wrapping) matching this exact format:
{
  "service": "One of: AC Repair, Plumbing, Electrical, Laptop Repair, Cleaning",
  "possibleProblem": "Short concise description of the root cause (under 12 words)",
  "priority": "One of: Low, Medium, High, Emergency",
  "recommendedAction": "Actionable recommendation for the customer (under 15 words)",
  "recommendedService": "Name of the recommended service",
  "estimatedCostRange": "e.g. ₹599 - ₹1,200",
  "suggestedDuration": "e.g. 60 mins"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    })();

    const parsed: any = await Promise.race([callPromise, timeoutPromise]);
    const db = getDb();
    const matchedService =
      db.services.find((s) => s.category.toLowerCase() === parsed.service?.toLowerCase()) ||
      db.services[0];

    return {
      service: parsed.service || matchedService.category,
      serviceId: matchedService._id,
      possibleProblem: parsed.possibleProblem || 'Diagnostic inspection recommended',
      priority: parsed.priority || 'Medium',
      recommendedAction: parsed.recommendedAction || 'Schedule a verified technician visit',
      recommendedService: parsed.recommendedService || matchedService.name,
      estimatedCostRange: parsed.estimatedCostRange || `₹${matchedService.price}`,
      suggestedDuration: parsed.suggestedDuration || `${matchedService.durationMinutes} mins`,
    };
  } catch (err) {
    console.warn('Gemini API call returned error or timed out, using fast smart fallback engine:', err);
    return getFallbackDiagnosis(query);
  }
}

export interface IAIAssistantResponse {
  role: 'CUSTOMER' | 'TECHNICIAN';
  message: string;
  category?: string;
  possibleProblem?: string;
  priority?: string;
  recommendedService?: string;
  recommendedServiceId?: string;
  recommendedAction?: string;
  estimatedCostRange?: string;
  troubleshootingSteps?: string[];
  toolsAndMaterials?: string[];
  safetyPrecautions?: string;
  quickPrompts?: string[];
}

export async function handleAIAssistantQuery(
  query: string,
  role: 'CUSTOMER' | 'TECHNICIAN',
  userContext?: { userName?: string; bookingContext?: any }
): Promise<IAIAssistantResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  const q = query.toLowerCase().trim();

  // Try Gemini if apiKey is present
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Assistant timeout')), 4500)
      );

      const systemPrompt =
        role === 'CUSTOMER'
          ? `You are ServiceHub Customer AI Assistant, a courteous, highly knowledgeable home maintenance concierge.
The customer asks: "${query}".
ServiceHub Cancellation Rules: Customers can cancel bookings that are in PENDING, TECHNICIAN_ASSIGNED, or ACCEPTED status via their "My Bookings" / "Track Service" page. Once the status is ARRIVED, IN_PROGRESS, or COMPLETED, self-service cancellation is not permitted and they must contact support.
Respond with ONLY a raw JSON object (no markdown, no backticks):
{
  "message": "Friendly, direct conversational answer (under 75 words).",
  "category": "e.g. AC Repair, Plumbing, Electrical, Cleaning, Appliance, or General",
  "possibleProblem": "Specific root cause if a technical issue is described, else null",
  "priority": "Low, Medium, High, or Emergency",
  "recommendedService": "Recommended service name if applicable, else null",
  "recommendedAction": "Actionable next step for the customer",
  "estimatedCostRange": "e.g. ₹599 - ₹1,200 if service is relevant, else null"
}`
          : `You are ServiceHub Senior Field Technician AI, an expert engineering troubleshooting mentor for field technicians.
The technician asks: "${query}".
Focus on actionable diagnostics, component tests, multimeter checks, and safety.
Respond with ONLY a raw JSON object (no markdown, no backticks):
{
  "message": "Clear, professional engineering explanation (under 90 words).",
  "troubleshootingSteps": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."],
  "toolsAndMaterials": ["Tool/part 1...", "Tool/part 2...", "Tool/part 3..."],
  "safetyPrecautions": "Key electrical or mechanical safety reminder."
}`;

      const callPromise = (async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt,
        });
        const text = response.text || '';
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      })();

      const res: any = await Promise.race([callPromise, timeoutPromise]);
      return {
        role,
        message: res.message || 'I have analyzed your query.',
        category: res.category,
        possibleProblem: res.possibleProblem,
        priority: res.priority,
        recommendedService: res.recommendedService,
        recommendedAction: res.recommendedAction,
        estimatedCostRange: res.estimatedCostRange,
        troubleshootingSteps: res.troubleshootingSteps,
        toolsAndMaterials: res.toolsAndMaterials,
        safetyPrecautions: res.safetyPrecautions,
      };
    } catch (e) {
      console.warn('Gemini Assistant fallback triggered:', e);
    }
  }

  // Robust domain-specific rule-based fallback
  const db = getDb();

  if (role === 'CUSTOMER') {
    if (q.includes('cancel') || q.includes('cancellation')) {
      return {
        role: 'CUSTOMER',
        message:
          'You can cancel your booking directly from your "My Bookings" or "Track Service" screen as long as the status is Pending, Technician Assigned, or Accepted. Simply click the "Cancel Booking" button and confirm. If the technician has already arrived or started work, cancellations can no longer be done online—please reach out to support.',
        category: 'Booking & Policy',
        recommendedAction: 'Visit "My Bookings" tab to cancel eligible bookings',
        priority: 'Medium',
        quickPrompts: ['How do I check my booking status?', 'Can I reschedule instead?'],
      };
    }

    if (q.includes('late') || q.includes('where is') || q.includes('delay') || q.includes('when will')) {
      return {
        role: 'CUSTOMER',
        message:
          'We apologize for any delay! You can check your technician\'s active dispatch status and estimated time of arrival live on the "Track Service" screen. If urgent, you can also use the "Call Technician" button on your booking card to speak directly with your assigned specialist.',
        category: 'Service Tracking',
        recommendedAction: 'Open "Track Service" page to view real-time transit status',
        priority: 'Medium',
        quickPrompts: ['Call assigned technician', 'Report a technician delay'],
      };
    }

    if (q.includes('cost') || q.includes('price') || q.includes('charge') || q.includes('rate') || q.includes('how much')) {
      if (q.includes('ac')) {
        return {
          role: 'CUSTOMER',
          message:
            'ServiceHub AC service rates start at ₹799 for Standard Jet Cleaning & Gas Pressure Check. Deep foam chemical wash is ₹1,199, and full refrigerant recharge is typically ₹1,200 to ₹1,800 depending on gas type (R-32 / R-410A). All services include a 30-day post-service warranty.',
          category: 'AC Repair',
          possibleProblem: 'General routine maintenance or periodic refrigerant top-up',
          priority: 'Low',
          recommendedService: 'AC Jet Cleaning & Gas Check',
          recommendedAction: 'Book an AC Jet Cleaning inspection',
          estimatedCostRange: '₹799 - ₹1,499',
          quickPrompts: ['Book AC Jet Cleaning', 'What is included in gas refill?'],
        };
      }
      return {
        role: 'CUSTOMER',
        message:
          'ServiceHub pricing is 100% transparent: Plumbing diagnostics start at ₹449, Electrical repairs start at ₹399, AC Jet Cleaning is ₹799, and Appliance servicing starts at ₹549. No hidden visiting charges when you complete the service!',
        category: 'Pricing Information',
        recommendedAction: 'Browse our service catalog for itemized price breakdowns',
        priority: 'Low',
      };
    }

    if (q.includes('ac') || q.includes('cooling') || q.includes('air conditioner')) {
      const acService = db.services.find((s) => s.category === 'AC Repair') || db.services[0];
      return {
        role: 'CUSTOMER',
        message:
          'If your AC is running without cooling, the most frequent causes are low refrigerant gas pressure, choked indoor air filters, or dust buildup on the outdoor condenser coils blocking heat dissipation. We recommend scheduling an on-site multi-point inspection.',
        category: 'AC Repair',
        possibleProblem: 'Low refrigerant charge (gas leak) or dirty indoor/outdoor coils',
        priority: 'Medium',
        recommendedService: acService.name,
        recommendedServiceId: acService._id,
        recommendedAction: 'Clean mesh filters and schedule an AC Jet Cleaning visit',
        estimatedCostRange: '₹799 - ₹1,299',
        quickPrompts: ['Book AC Jet Cleaning', 'How long does AC service take?'],
      };
    }

    if (q.includes('washing machine') || q.includes('noise') || q.includes('vibrat') || q.includes('drum')) {
      return {
        role: 'CUSTOMER',
        message:
          'Strange noises during washing machine spin cycles usually point to worn-out drum bearings, an unbalanced machine leveling foot, or small foreign objects (coins/pins) caught in the drain pump filter. Discontinue high-speed spin cycles until an expert inspects it to prevent tub damage.',
        category: 'Appliance Repair',
        possibleProblem: 'Worn drum bearings, loose spider arm, or blocked drain pump',
        priority: 'Medium',
        recommendedService: 'Washing Machine Inspection & Repair',
        recommendedAction: 'Ensure load is balanced and book a doorstep diagnostic inspection',
        estimatedCostRange: '₹499 - ₹899',
        quickPrompts: ['Book Appliance Service', 'Can I run a wash cycle safely?'],
      };
    }

    if (q.includes('what service') || q.includes('recommend') || q.includes('which service') || q.includes('book')) {
      return {
        role: 'CUSTOMER',
        message:
          'ServiceHub offers certified services across AC Repair, Plumbing, Electrical, Cleaning, Appliance Servicing, and Laptop Diagnostics. Tell me the specific problem you are experiencing (e.g. leaking pipe, power tripping, slow cooling), and I will instantly recommend the right verified technician for you!',
        category: 'General Recommendation',
        recommendedAction: 'Type your appliance symptom or browse our catalog',
        priority: 'Low',
      };
    }

    // Default customer fallback
    const diag = getFallbackDiagnosis(query);
    return {
      role: 'CUSTOMER',
      message: `Based on your description of "${query}", our diagnostic system suggests a potential ${diag.possibleProblem.toLowerCase()}. We recommend booking ${diag.recommendedService} for a certified inspection.`,
      category: diag.service,
      possibleProblem: diag.possibleProblem,
      priority: diag.priority,
      recommendedService: diag.recommendedService,
      recommendedServiceId: diag.serviceId,
      recommendedAction: diag.recommendedAction,
      estimatedCostRange: diag.estimatedCostRange,
    };
  }

  // Technician role fallbacks
  if (q.includes('ac') || q.includes('cooling') || q.includes('compressor')) {
    return {
      role: 'TECHNICIAN',
      message:
        'For AC cooling failure, systematic triage is required: verify airflow volume, measure supply vs. return air delta-T (target 8°C-12°C), test compressor run capacitor under load, and check suction/discharge pressures with a digital manifold gauge.',
      troubleshootingSteps: [
        'Inspect indoor blower wheel and filters for severe particulate clogging.',
        'Measure supply voltage at outdoor unit terminals (220V - 240V ± 5%).',
        'Test run capacitor with capacitance meter (must be within ±5% of rated µF).',
        'Connect manifold gauges to suction valve port to inspect running pressure (R-32 ~110-125 PSI; R-410A ~120-130 PSI).',
        'Perform soapy water bubble test on flare nut joints and indoor U-bends for micro-leaks.',
      ],
      toolsAndMaterials: [
        'Digital Clamp Meter with True-RMS',
        'Digital Refrigerant Manifold Gauges',
        'Capacitance Meter',
        'Electronic Leak Detector or Nu-Calgon Bubble Solution',
        'Adjustable Spanners (8", 10")',
        'Fin Comb and Coil Cleaner Spray',
      ],
      safetyPrecautions:
        'Always isolate 230V mains breaker before removing outdoor terminal cover. Discharge run capacitors with a 20kΩ bleeder resistor before touching terminals.',
    };
  }

  if (q.includes('check before replacing') || q.includes('before replacing') || q.includes('replace a part')) {
    return {
      role: 'TECHNICIAN',
      message:
        'Before replacing any component, strictly rule out secondary electrical or mechanical factors to ensure you do not burn out a replacement part or misdiagnose.',
      troubleshootingSteps: [
        'Isolate input power at the sub-panel breaker and tag out the switch.',
        'Verify zero potential with a non-contact AC voltage tester and calibrated multimeter.',
        'Verify load resistance against OEM specifications (e.g. compressor winding resistance C-S and C-R).',
        'Check for charred wiring, loose push-on spade connectors, or high-resistance thermal junctions.',
        'Ensure input control signal (e.g. 12V DC / 24V AC contactor coil signal) is actually arriving from the PCB.',
      ],
      toolsAndMaterials: [
        'True-RMS Digital Multimeter',
        'Insulated Screwdriver Set (1000V rated)',
        'Wire Strippers & Terminal Crimping Pliers',
        'Spare fast-blow fuses',
      ],
      safetyPrecautions:
        'Never test continuity on energized live circuits. Always wear safety glasses when handling pressurized gas fittings or electrical contactors.',
    };
  }

  if (q.includes('tools') || q.includes('materials') || q.includes('equipment')) {
    return {
      role: 'TECHNICIAN',
      message:
        'Standard field service kit requirements depend on the assignment category. Ensure all diagnostic tools are calibrated and safety gear is equipped before proceeding to the customer doorstep.',
      troubleshootingSteps: [
        'Inspect hand tools for insulation breakdown.',
        'Check test lead probes for cracked insulation or worn tips.',
        'Ensure refrigerant cylinder tare weight and gas purity certificates are valid.',
        'Carry PPE: Clean shoe covers, safety glasses, anti-static gloves, and ServiceHub technician ID.',
      ],
      toolsAndMaterials: [
        'Digital Clamp Multimeter with Temp Probe',
        'Cordless Drill Driver with magnetic hex bits',
        'Vacuum Pump (2-stage, 45+ microns capability)',
        'Torque Wrench for flare connections',
        'Nitrogen cylinder with 0-500 PSI regulator for pressure testing',
      ],
      safetyPrecautions:
        'Wear shoe covers inside customer premises to maintain ServiceHub five-star cleanliness standards.',
    };
  }

  // General technician troubleshooting
  return {
    role: 'TECHNICIAN',
    message:
      'Standard 6-step ServiceHub diagnostic protocol: 1. Customer symptom verification, 2. Visual & electrical baseline check, 3. Component isolation, 4. Root cause confirmation, 5. Clean part replacement, 6. 15-minute verification run with operational telemetry logging.',
    troubleshootingSteps: [
      'Interview customer briefly about when the symptom first presented.',
      'Check input power line voltage, neutral-to-earth voltage (< 2V AC).',
      'Conduct non-invasive visual inspection for burnt PCB traces or oil staining (indicates gas leak).',
      'Isolate suspect component and benchmark against manufacturer specifications.',
      'Document before-and-after photo evidence via your technician portal.',
    ],
    toolsAndMaterials: [
      'Digital Clamp Meter',
      'Infrared Thermal Thermometer',
      'Precision Screwdriver Kit',
      'Megohmmeter / Insulation Resistance Tester',
    ],
    safetyPrecautions:
      'Lock out all circuit breakers before touching internal wiring. Adhere to Indian Standard IS 732 electrical installation code.',
  };
}
