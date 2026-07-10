const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { authenticateJWT } = require('../middleware/auth');

// GET /: Fetches the financial profile (dossier) for the authenticated user, including their guarantors.
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const dossier = await prisma.dossier.findUnique({
      where: { userId: req.user.id },
      include: { guarantors: true }
    });
    
    if (!dossier) {
      return res.status(404).json({ message: 'Dossier not found' });
    }
    
    res.json(dossier);
  } catch (error) {
    console.error('Error fetching dossier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /: Upserts (creates or updates) the user's financial profile and guarantor list in the PostgreSQL database.
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { targetRent, monthlyIncome, employmentStatus, guarantors } = req.body;
    
    // Check if dossier already exists
    let dossier = await prisma.dossier.findUnique({
      where: { userId: req.user.id }
    });

    if (dossier) {
      // Update existing dossier
      dossier = await prisma.dossier.update({
        where: { id: dossier.id },
        data: {
          targetRent: parseFloat(targetRent),
          monthlyIncome: parseFloat(monthlyIncome),
          employmentStatus
        }
      });
      
      // Delete old guarantors and insert new ones
      await prisma.guarantor.deleteMany({
        where: { dossierId: dossier.id }
      });
      
    } else {
      // Create new dossier
      dossier = await prisma.dossier.create({
        data: {
          userId: req.user.id,
          targetRent: parseFloat(targetRent),
          monthlyIncome: parseFloat(monthlyIncome),
          employmentStatus
        }
      });
    }

    // Insert new guarantors if any
    if (guarantors && guarantors.length > 0) {
      const guarantorData = guarantors.map(g => ({
        dossierId: dossier.id,
        name: g.name,
        monthlyIncome: parseFloat(g.monthlyIncome)
      }));
      
      await prisma.guarantor.createMany({
        data: guarantorData
      });
    }

    // Fetch the updated dossier with guarantors
    const completeDossier = await prisma.dossier.findUnique({
      where: { id: dossier.id },
      include: { guarantors: true }
    });

    res.json(completeDossier);
    
  } catch (error) {
    console.error('Error saving dossier:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
