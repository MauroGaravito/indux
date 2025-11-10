import { Request, Response } from 'express';
import { BrandConfig } from '../models/BrandConfig.js';

// Very small helpers for simple validation
function isNonEmptyString(v: any) { return typeof v === 'string' && v.trim().length > 0 }
function isColor(v: any) { return typeof v === 'string' && v.trim().length > 0 }

/**
 * GET the current BrandConfig document.
 * Since only one config is expected, we return the most recently created/updated one.
 */
export async function getBrandConfig(_req: Request, res: Response) {
  try {
    const cfg = await BrandConfig.findOne().sort({ updatedAt: -1, createdAt: -1 }).lean();
    return res.json(cfg || null);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch brand config' });
  }
}

/**
 * CREATE or UPSERT the BrandConfig document.
 * If an entry exists, we update it; otherwise we create a new one.
 */
export async function createBrandConfig(req: Request, res: Response) {
  try {
    const { companyName, logoUrl, primaryColor, secondaryColor } = req.body || {};

    if (!isNonEmptyString(companyName)) {
      return res.status(400).json({ error: 'companyName is required' });
    }
    if (primaryColor != null && !isColor(primaryColor)) {
      return res.status(400).json({ error: 'primaryColor must be a string' });
    }
    if (secondaryColor != null && !isColor(secondaryColor)) {
      return res.status(400).json({ error: 'secondaryColor must be a string' });
    }

    const existing = await BrandConfig.findOne().sort({ updatedAt: -1, createdAt: -1 });
    if (existing) {
      existing.companyName = companyName;
      if (typeof logoUrl === 'string') existing.logoUrl = logoUrl;
      if (typeof primaryColor === 'string') existing.primaryColor = primaryColor;
      if (typeof secondaryColor === 'string') existing.secondaryColor = secondaryColor;
      if (req.user?.sub) existing.createdBy = existing.createdBy || (req.user.sub as any);
      await existing.save();
      return res.status(200).json(existing);
    }

    const created = await BrandConfig.create({
      companyName,
      logoUrl: typeof logoUrl === 'string' ? logoUrl : '',
      primaryColor: typeof primaryColor === 'string' ? primaryColor : undefined,
      secondaryColor: typeof secondaryColor === 'string' ? secondaryColor : undefined,
      createdBy: req.user?.sub as any,
    });
    return res.status(201).json(created);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to create brand config' });
  }
}

/**
 * UPDATE BrandConfig by id.
 */
export async function updateBrandConfig(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const patch: any = {};
    const { companyName, logoUrl, primaryColor, secondaryColor } = req.body || {};
    if (companyName != null) {
      if (!isNonEmptyString(companyName)) return res.status(400).json({ error: 'companyName must be non-empty' });
      patch.companyName = companyName;
    }
    if (logoUrl != null) {
      if (typeof logoUrl !== 'string') return res.status(400).json({ error: 'logoUrl must be a string' });
      patch.logoUrl = logoUrl;
    }
    if (primaryColor != null) {
      if (!isColor(primaryColor)) return res.status(400).json({ error: 'primaryColor must be a string' });
      patch.primaryColor = primaryColor;
    }
    if (secondaryColor != null) {
      if (!isColor(secondaryColor)) return res.status(400).json({ error: 'secondaryColor must be a string' });
      patch.secondaryColor = secondaryColor;
    }

    const updated = await BrandConfig.findByIdAndUpdate(id, patch, { new: true });
    if (!updated) return res.status(404).json({ error: 'Brand config not found' });
    return res.json(updated);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to update brand config' });
  }
}

