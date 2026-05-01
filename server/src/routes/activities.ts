import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todas as atividades
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, type, customerId, completed } = req.query;
    
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        deal: {
          select: { id: true, title: true, stage: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { scheduledAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.activity.count({ where });

    res.json({
      activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// Obter atividade por ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true, phone: true }
        },
        deal: {
          select: { id: true, title: true, stage: true, value: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

// Criar nova atividade
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { 
      type, 
      title, 
      description, 
      customerId, 
      dealId, 
      scheduledAt,
      completed = false
    } = req.body;

    if (!type || !title || !customerId || !scheduledAt) {
      return res.status(400).json({ error: 'Type, title, customerId and scheduledAt are required' });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        customerId,
        dealId,
        userId: req.userId!,
        completed,
        scheduledAt: new Date(scheduledAt)
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        deal: {
          select: { id: true, title: true, stage: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Atualizar atividade
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { 
      type, 
      title, 
      description, 
      completed, 
      scheduledAt 
    } = req.body;

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        type,
        title,
        description,
        completed,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        deal: {
          select: { id: true, title: true, stage: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// Excluir atividade
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.activity.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

// Obter atividades pendentes do usuário
router.get('/pending/my-activities', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        completed: false,
        scheduledAt: {
          lte: new Date()
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        deal: {
          select: { id: true, title: true, stage: true }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10
    });

    res.json(activities);
  } catch (error) {
    console.error('Get pending activities error:', error);
    res.status(500).json({ error: 'Failed to get pending activities' });
  }
});

export default router;
