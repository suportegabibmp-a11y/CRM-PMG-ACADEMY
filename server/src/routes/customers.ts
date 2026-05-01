import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Listar todos os clientes
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { company: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = status;
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        deals: {
          select: { id: true, title: true, value: true, stage: true }
        },
        _count: {
          select: { activities: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.customer.count({ where });

    res.json({
      customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

// Obter cliente por ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        deals: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
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

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

// Criar novo cliente
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, company, position, segment, value } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Verificar se email já existe
    const existingCustomer = await prisma.customer.findUnique({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer with this email already exists' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        position,
        segment,
        value: value ? parseFloat(value) : null,
        createdBy: req.userId!
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Atualizar cliente
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, company, position, segment, status, value } = req.body;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name,
        email,
        phone,
        company,
        position,
        segment,
        status,
        value: value ? parseFloat(value) : null
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Excluir cliente
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
