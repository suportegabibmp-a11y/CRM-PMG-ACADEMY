import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard principal - métricas gerais
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Métricas de clientes
    const totalCustomers = await prisma.customer.count();
    const newCustomersThisMonth = await prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    // Métricas de deals
    const totalDeals = await prisma.deal.count();
    const dealsThisMonth = await prisma.deal.count({
      where: { createdAt: { gte: startOfMonth } }
    });
    const wonDealsThisMonth = await prisma.deal.count({
      where: { 
        stage: 'CLOSED_WON',
        updatedAt: { gte: startOfMonth }
      }
    });

    // Valor total
    const totalPipelineValue = await prisma.deal.aggregate({
      where: { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } },
      _sum: { value: true }
    });

    const wonValueThisMonth = await prisma.deal.aggregate({
      where: { 
        stage: 'CLOSED_WON',
        updatedAt: { gte: startOfMonth }
      },
      _sum: { value: true }
    });

    // Taxa de conversão
    const conversionRate = dealsThisMonth > 0 ? (wonDealsThisMonth / dealsThisMonth) * 100 : 0;

    // Atividades recentes
    const recentActivities = await prisma.activity.count({
      where: { 
        createdAt: { gte: startOfMonth },
        completed: true
      }
    });

    // Métricas do mês passado para comparação
    const wonDealsLastMonth = await prisma.deal.count({
      where: { 
        stage: 'CLOSED_WON',
        updatedAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    });

    const wonValueLastMonth = await prisma.deal.aggregate({
      where: { 
        stage: 'CLOSED_WON',
        updatedAt: { 
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      },
      _sum: { value: true }
    });

    res.json({
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth
      },
      deals: {
        total: totalDeals,
        newThisMonth: dealsThisMonth,
        wonThisMonth: wonDealsThisMonth,
        conversionRate: Math.round(conversionRate * 100) / 100
      },
      value: {
        totalPipeline: totalPipelineValue._sum.value || 0,
        wonThisMonth: wonValueThisMonth._sum.value || 0,
        wonLastMonth: wonValueLastMonth._sum.value || 0,
        growth: wonValueLastMonth._sum.value ? 
          Math.round(((wonValueThisMonth._sum.value! - wonValueLastMonth._sum.value!) / wonValueLastMonth._sum.value!) * 100 * 100) / 100 : 0
      },
      activities: {
        completedThisMonth: recentActivities
      },
      comparison: {
        dealsGrowth: wonDealsLastMonth > 0 ? 
          Math.round(((wonDealsThisMonth - wonDealsLastMonth) / wonDealsLastMonth) * 100 * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to get dashboard metrics' });
  }
});

// Pipeline por estágio
router.get('/pipeline', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const pipeline = await prisma.deal.groupBy({
      by: ['stage'],
      _count: { id: true },
      _sum: { value: true }
    });

    const formattedPipeline = pipeline.map(item => ({
      stage: item.stage,
      count: item._count.id,
      value: item._sum.value || 0
    }));

    res.json(formattedPipeline);
  } catch (error) {
    console.error('Get pipeline metrics error:', error);
    res.status(500).json({ error: 'Failed to get pipeline metrics' });
  }
});

// Métricas por vendedor
router.get('/sales-performance', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const salesPerformance = await prisma.user.findMany({
      where: { role: { in: ['USER', 'MANAGER'] } },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            deals: {
              where: { createdAt: { gte: startOfMonth } }
            }
          }
        },
        deals: {
          where: { 
            stage: 'CLOSED_WON',
            updatedAt: { gte: startOfMonth }
          },
          select: {
            value: true
          }
        }
      }
    });

    const performance = salesPerformance.map(user => {
      const wonDeals = user.deals;
      const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
      const conversionRate = user._count.deals > 0 ? 
        (wonDeals.length / user._count.deals) * 100 : 0;

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        metrics: {
          totalDeals: user._count.deals,
          wonDeals: wonDeals.length,
          totalValue: totalWonValue,
          conversionRate: Math.round(conversionRate * 100) / 100,
          avgDealValue: wonDeals.length > 0 ? totalWonValue / wonDeals.length : 0
        }
      };
    });

    res.json(performance);
  } catch (error) {
    console.error('Get sales performance error:', error);
    res.status(500).json({ error: 'Failed to get sales performance' });
  }
});

// Métricas de conversão por período
router.get('/conversion-funnel', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));

    const funnelData = await prisma.deal.groupBy({
      by: ['stage'],
      where: {
        createdAt: { gte: daysAgo }
      },
      _count: { id: true },
      _sum: { value: true }
    });

    const stages = ['LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    const funnel = stages.map(stage => {
      const stageData = funnelData.find(item => item.stage === stage);
      return {
        stage,
        count: stageData?._count.id || 0,
        value: stageData?._sum.value || 0,
        conversionRate: 0 // Will be calculated on frontend
      };
    });

    res.json(funnel);
  } catch (error) {
    console.error('Get conversion funnel error:', error);
    res.status(500).json({ error: 'Failed to get conversion funnel' });
  }
});

// Métricas de atividades
router.get('/activities', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const activitiesByType = await prisma.activity.groupBy({
      by: ['type'],
      where: { createdAt: { gte: startOfMonth } },
      _count: { id: true }
    });

    const completedActivities = await prisma.activity.count({
      where: { 
        completed: true,
        createdAt: { gte: startOfMonth }
      }
    });

    const pendingActivities = await prisma.activity.count({
      where: { 
        completed: false,
        scheduledAt: { lte: new Date() }
      }
    });

    res.json({
      byType: activitiesByType,
      completedThisMonth: completedActivities,
      pendingNow: pendingActivities
    });
  } catch (error) {
    console.error('Get activities metrics error:', error);
    res.status(500).json({ error: 'Failed to get activities metrics' });
  }
});

export default router;
