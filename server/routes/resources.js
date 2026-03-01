import { Router } from 'express';
import auth from '../middleware/auth.js';
import Resource from '../models/Resource.js';

const router = Router();
router.use(auth);

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find({ userId: req.userId }).sort({ createdAt: -1 });
    const mapped = resources.map(r => ({
      id: r._id.toString(),
      type: r.type,
      title: r.title,
      subjectId: r.subjectId,
      isFavorite: r.isFavorite,
      tags: r.tags,
      fileUrl: r.fileUrl,
      fileType: r.fileType,
      fileSize: r.fileSize,
      fileId: r.fileId,
      url: r.url,
      youtubeUrl: r.youtubeUrl,
      thumbnailUrl: r.thumbnailUrl,
      content: r.content,
      createdAt: r.createdAt
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources
router.post('/', async (req, res) => {
  try {
    const resource = await Resource.create({ ...req.body, userId: req.userId });
    res.status(201).json({
      id: resource._id.toString(),
      type: resource.type,
      title: resource.title,
      subjectId: resource.subjectId,
      isFavorite: resource.isFavorite,
      tags: resource.tags,
      fileUrl: resource.fileUrl,
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      fileId: resource.fileId,
      url: resource.url,
      youtubeUrl: resource.youtubeUrl,
      thumbnailUrl: resource.thumbnailUrl,
      content: resource.content,
      createdAt: resource.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT /api/resources/:id
router.put('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({
      id: resource._id.toString(),
      type: resource.type,
      title: resource.title,
      subjectId: resource.subjectId,
      isFavorite: resource.isFavorite,
      tags: resource.tags,
      fileUrl: resource.fileUrl,
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      fileId: resource.fileId,
      url: resource.url,
      youtubeUrl: resource.youtubeUrl,
      thumbnailUrl: resource.thumbnailUrl,
      content: resource.content,
      createdAt: resource.createdAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
