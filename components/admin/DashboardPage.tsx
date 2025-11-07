import React, { useState, useEffect, useMemo } from 'react';
import type { Lead, LeadStatus } from '../../types';
import { getLeads } from '../../services/storageService';
import { LeadsIcon, FireIcon, TrendingUpIcon } from '../Icons';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4 transition-transform transform hover:scale-105">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-brand-dark">{value}</p>
        </div>
    </div>
);

const statusMap: Record<LeadStatus, { text: string; color: string; bgColor: string }> = {
  new: { text: 'Novo', color: 'text-blue-800', bgColor: 'bg-blue-500' },
  contacted: { text: 'Contatado', color: 'text-yellow-800', bgColor: 'bg-yellow-500' },
  'in-progress': { text: 'Em Progresso', color: 'text-purple-800', bgColor: 'bg-purple-500' },
  closed: { text: 'Fechado', color: 'text-green-800', bgColor: 'bg-green-500' },
  archived: { text: 'Arquivado', color: 'text-gray-800', bgColor: 'bg-gray-500' },
};

const TimeRangeFilter: React.FC<{
    selected: '7d' | '30d' | 'all';
    onSelect: (range: '7d' | '30d' | 'all') => void;
}> = ({ selected, onSelect }) => {
    const buttonClass = (range: '7d' | '30d' | 'all') => 
        `px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            selected === range 
                ? 'bg-brand-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;
    
    return (
        <div className="flex items-center gap-2">
            <button onClick={() => onSelect('7d')} className={buttonClass('7d')}>7 dias</button>
            <button onClick={() => onSelect('30d')} className={buttonClass('30d')}>30 dias</button>
            <button onClick={() => onSelect('all')} className={buttonClass('all')}>Tudo</button>
        </div>
    );
}


export const DashboardPage: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('all');

    useEffect(() => {
        setLeads(getLeads());
    }, []);

    const filteredLeads = useMemo(() => {
        if (timeRange === 'all') return leads;
        const days = timeRange === '7d' ? 7 : 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return leads.filter(lead => new Date(lead.timestamp) >= cutoffDate);
    }, [leads, timeRange]);

    const stats = useMemo(() => {
        const total = filteredLeads.length;
        const newLeadsCount = filteredLeads.filter(l => l.status === 'new').length;
        const hotLeadsCount = filteredLeads.filter(l => l.score === 'hot').length;
        const closedLeadsCount = filteredLeads.filter(l => l.status === 'closed').length;
        const conversionRate = total > 0 ? ((closedLeadsCount / total) * 100).toFixed(1) : '0.0';
        
        const statusCounts: Record<LeadStatus, number> = {
            'new': 0, 'contacted': 0, 'in-progress': 0, 'closed': 0, 'archived': 0
        };
        filteredLeads.forEach(lead => {
            if (lead.status in statusCounts) {
                statusCounts[lead.status]++;
            }
        });

        return { total, newLeadsCount, hotLeadsCount, conversionRate, statusCounts };
    }, [filteredLeads]);

    const recentLeads = useMemo(() => {
        return [...leads]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [leads]);

    const maxStatusCount = Math.max(...Object.values(stats.statusCounts).map(Number), 1);
    
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <h1 className="text-3xl font-bold text-brand-dark">Dashboard</h1>
                 <TimeRangeFilter selected={timeRange} onSelect={setTimeRange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total de Leads" 
                    value={stats.total.toString()}
                    icon={<LeadsIcon />}
                    color="bg-blue-100 text-blue-600"
                />
                 <StatCard 
                    title="Leads Quentes" 
                    value={stats.hotLeadsCount.toString()}
                    icon={<FireIcon className="h-6 w-6 text-red-600" />}
                    color="bg-red-100"
                />
                 <StatCard 
                    title="Novos Leads" 
                    value={stats.newLeadsCount.toString()}
                    icon={<LeadsIcon />}
                    color="bg-yellow-100 text-yellow-600"
                />
                 <StatCard 
                    title="Taxa de Conversão" 
                    value={`${stats.conversionRate}%`}
                    icon={<TrendingUpIcon />}
                    color="bg-green-100 text-green-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-brand-dark mb-4">Leads Recentes</h2>
                    <div className="space-y-4">
                        {recentLeads.length > 0 ? recentLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                <div>
                                    <p className="font-semibold text-brand-dark">{lead.name}</p>
                                    <p className="text-sm text-gray-500">{lead.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="text-sm text-gray-700">{new Date(lead.timestamp).toLocaleDateString('pt-BR')}</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusMap[lead.status].color} ${statusMap[lead.status].bgColor.replace('bg-', 'bg-opacity-20 ')}`}>
                                        {statusMap[lead.status].text}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500">Nenhum lead encontrado.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-brand-dark mb-4">Leads por Status</h2>
                    <div className="space-y-4">
                        {Object.entries(stats.statusCounts).map(([status, count]) => (
                            <div key={status}>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-medium text-gray-700">{statusMap[status as LeadStatus].text}</span>
                                    <span className="font-bold text-brand-dark">{count}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-2 rounded-full ${statusMap[status as LeadStatus].bgColor} transition-all duration-500`}
                                        style={{ width: `${(Number(count) / maxStatusCount) * 100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};