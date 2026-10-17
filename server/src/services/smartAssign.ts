import { ITechnician, IService } from '../types/index.ts';

export interface ITechnicianRecommendation {
  technician: ITechnician;
  score: number; // 0 - 100
  breakdown: {
    skillMatchScore: number; // max 40
    availabilityScore: number; // max 20
    distanceScore: number; // max 20
    ratingScore: number; // max 10
    workloadScore: number; // max 10
  };
  distanceKm: number;
  skillMatchPercentage: number;
}

// Approximate Pune area coordinates for distance calculations
const AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Baner: { lat: 18.559, lng: 73.7868 },
  Wakad: { lat: 18.5987, lng: 73.7667 },
  Hinjewadi: { lat: 18.5913, lng: 73.7389 },
  Aundh: { lat: 18.5626, lng: 73.8087 },
  Kothrud: { lat: 18.5074, lng: 73.8077 },
  Bavdhan: { lat: 18.5158, lng: 73.7744 },
  'Viman Nagar': { lat: 18.5679, lng: 73.9143 },
  'Koregaon Park': { lat: 18.5362, lng: 73.894 },
  'Shivaji Nagar': { lat: 18.5314, lng: 73.8446 },
};

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function rankTechniciansForService(
  technicians: ITechnician[],
  service: IService,
  targetArea: string
): ITechnicianRecommendation[] {
  const targetCoord = AREA_COORDINATES[targetArea] || { lat: 18.559, lng: 73.7868 };

  const recommendations: ITechnicianRecommendation[] = technicians.map((tech) => {
    // 1. Skill Match: 40%
    const required = service.requiredSkills || [];
    let matchedSkills = 0;
    if (required.length === 0) {
      matchedSkills = 1;
    } else {
      matchedSkills = required.filter((req) =>
        tech.skills.some((techSkill) => techSkill.toLowerCase().includes(req.toLowerCase()))
      ).length;
    }
    const skillRatio = required.length > 0 ? matchedSkills / required.length : 0.8;
    const skillMatchPercentage = Math.round(skillRatio * 100);
    const skillMatchScore = Math.round(skillRatio * 40);

    // 2. Availability: 20%
    const availabilityScore = tech.isAvailable ? 20 : 5;

    // 3. Distance: 20%
    const distanceKm = calculateDistanceKm(
      tech.latitude || 18.559,
      tech.longitude || 73.7868,
      targetCoord.lat,
      targetCoord.lng
    );
    // If under 3km: 20 pts, decreases linearly up to 20km
    const distanceScore = Math.max(0, Math.round(20 - Math.min(20, (distanceKm / 20) * 20)));

    // 4. Rating: 10%
    // 5.0 rating = 10 pts, 4.0 = 8 pts
    const ratingScore = Math.round((tech.rating / 5.0) * 10);

    // 5. Workload: 10%
    // 0 active jobs = 10 pts, 1 = 8 pts, 2 = 6 pts, 3+ = 2 pts
    const workloadScore = Math.max(2, 10 - tech.activeJobs * 2.5);

    const totalScore = Math.min(
      99,
      Math.max(30, skillMatchScore + availabilityScore + distanceScore + ratingScore + workloadScore)
    );

    return {
      technician: tech,
      score: totalScore,
      breakdown: {
        skillMatchScore,
        availabilityScore,
        distanceScore,
        ratingScore,
        workloadScore,
      },
      distanceKm,
      skillMatchPercentage,
    };
  });

  return recommendations.sort((a, b) => b.score - a.score);
}
