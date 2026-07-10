/**
 * Calculates a score out of 100 based on financial data and document checklist.
 * @param {Object} dossier - From Main Backend
 * @param {Object} checklist - From Document Service
 */
const calculateScore = (dossier, checklist) => {
  let score = 0;
  const suggestions = [];
  const missingDocuments = [];

  // 1. Document Completeness (25 pts)
  // Required: idCard, proofOfIncome, proofOfAddress, guarantorId, guarantorIncome (at least 1)
  let docPoints = 0;
  if (checklist.idCard) docPoints += 5; else missingDocuments.push('Identity Card');
  if (checklist.proofOfIncome) docPoints += 5; else missingDocuments.push('Proof of Income');
  if (checklist.proofOfAddress) docPoints += 5; else missingDocuments.push('Proof of Address');
  if (checklist.guarantorId) docPoints += 5; else missingDocuments.push('Guarantor ID');
  if (checklist.guarantorIncome > 0) docPoints += 5; else missingDocuments.push('Guarantor Proof of Income');
  
  score += docPoints;
  if (docPoints < 25) {
    suggestions.push(`Upload missing documents: ${missingDocuments.join(', ')}`);
  }

  if (!dossier) {
    suggestions.push('No financial profile found. Please fill out your dossier.');
    return { score, suggestions, missingDocuments };
  }

  const { targetRent, monthlyIncome, employmentStatus, guarantors } = dossier;

  // 2. Rent Affordability (25 pts)
  if (monthlyIncome > 0 && targetRent > 0) {
    const ratio = targetRent / monthlyIncome;
    if (ratio <= 0.33) {
      score += 25;
    } else if (ratio <= 0.45) {
      score += 15;
      suggestions.push('Your rent is quite high compared to your income (over 33%).');
    } else {
      score += 5;
      suggestions.push('Your rent-to-income ratio is very high. Consider looking for a cheaper apartment or adding a stronger guarantor.');
    }
  } else {
    suggestions.push('Please provide your monthly income and target rent.');
  }

  // 3. Guarantor Strength (25 pts)
  let guarantorIncome = 0;
  if (guarantors && guarantors.length > 0) {
    guarantorIncome = guarantors.reduce((sum, g) => sum + (g.monthlyIncome || 0), 0);
  }

  if (targetRent > 0 && guarantorIncome >= targetRent * 3) {
    score += 25;
  } else if (targetRent > 0 && guarantorIncome >= targetRent * 2) {
    score += 15;
    suggestions.push('Your guarantors are acceptable, but a stronger guarantor would improve your score.');
  } else if (guarantorIncome > 0) {
    score += 5;
    suggestions.push('Your guarantors earn less than 2x the rent. Consider adding another guarantor.');
  } else {
    suggestions.push('You do not have a guarantor with income. Adding one significantly boosts your profile.');
  }

  // 4. Profile Stability (15 pts)
  if (employmentStatus === 'CDI') {
    score += 15;
  } else if (employmentStatus === 'CDD' || employmentStatus === 'Student') {
    score += 10;
    suggestions.push(`As a ${employmentStatus}, landlords may request extra guarantees.`);
  } else if (employmentStatus) {
    score += 5;
  } else {
    suggestions.push('Please provide your employment status.');
  }

  // 5. Profile Clarity (10 pts)
  if (targetRent && monthlyIncome && employmentStatus) {
    score += 10; // Base points for having the core fields filled
  }

  // Ensure score doesn't exceed 100
  score = Math.min(score, 100);

  // General evaluation
  if (score >= 90) suggestions.push('Excellent profile! You are highly competitive.');
  else if (score >= 70) suggestions.push('Strong profile. Most landlords will consider you.');
  else if (score >= 50) suggestions.push('Average profile. Follow the suggestions to improve.');
  else suggestions.push('Weak profile. It may be difficult to secure an apartment without improvements.');

  return {
    score,
    suggestions,
    missingDocuments
  };
};

module.exports = { calculateScore };
