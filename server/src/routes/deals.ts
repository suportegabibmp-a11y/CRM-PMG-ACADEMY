import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os deals
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, stage, assignedTo } = req.query;
    
    const where: any = {};
    
    if (stage) {
      where.stage = stage;
    }
    
    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { activities: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.deal.count({ where });

    res.json({
      deals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

// Obter deal por ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true, phone: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ error: 'Failed to get deal' });
  }
});

// Criar novo deal
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { 
      title, 
      description, 
      value, 
      customerId, 
      assignedTo, 
      probability = 0,
      expectedCloseDate 
    } = req.body;

    if (!title || !value || !customerId || !assignedTo) {
      return res.status(400).json({ error: 'Title, value, customerId and assignedTo are required' });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        value: parseFloat(value),
        customerId,
        assignedTo,
        probability: parseInt(probability),
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(deal);
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Atualizar deal
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { 
      title, 
      description, 
      value, 
      stage, 
      assignedTo, 
      probability,
      expectedCloseDate 
    } = req.body;

    const deal = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        value: value ? parseFloat(value) : undefined,
        stage,
        assignedTo,
        probability: probability !== undefined ? parseInt(probability) : undefined,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, company: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(deal);
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Excluir deal
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.deal.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ error: 'Failed to delete deal' });
  }
});

// Obter pipeline de vendas
router.get('/pipeline/summary', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const pipeline = await prisma.deal.groupBy({
      by: ['stage'],
      _count: {
        id: true
      },
      _sum: {
        value: true
      }
    });

    const formattedPipeline = pipeline.map(item => ({
      stage: item.stage,
      count: item._count.id,
      totalValue: item._sum.value || 0
    }));

    res.json(formattedPipeline);
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ error: 'Failed to get pipeline' });
  }
});

export default router;
