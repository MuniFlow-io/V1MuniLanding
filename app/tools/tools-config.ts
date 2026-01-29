/**
 * Tools Configuration
 * Defines all MuniFlow tools for the tools page
 */

export type ToolStatus = 'available' | 'coming-soon' | 'beta';

export interface Tool {
  id: string;
  name: string;
  description: string;
  status: ToolStatus;
  href: string;
  icon: 'FileText' | 'Calculator' | 'Calendar';
  targetUsers: string[];
  launchedDate?: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'bond-generator',
    name: 'Bond Generator',
    description: 'Deterministic assembly of executed bond certificates from finalized inputs.',
    status: 'available',
    href: '/bond-generator',
    icon: 'FileText',
    targetUsers: ['Paralegals', 'Deal Admins', 'Bond Counsel'],
    launchedDate: '2026-01',
  },
  {
    id: 'deal-term-manager',
    name: 'Deal Term Manager',
    description: 'Structured tracking and versioning of deal terms across transaction lifecycle.',
    status: 'coming-soon',
    href: '/tools#coming-soon',
    icon: 'Calculator',
    targetUsers: ['Financial Advisors', 'Bond Counsel', 'Issuers'],
  },
  {
    id: 'document-assembly',
    name: 'Document Assembly',
    description: 'Automated assembly of closing documents with validation and version control.',
    status: 'coming-soon',
    href: '/tools#coming-soon',
    icon: 'Calendar',
    targetUsers: ['Paralegals', 'Bond Counsel', 'Deal Admins'],
  },
];

// Helper functions
export const getAvailableTools = () => TOOLS.filter(t => t.status === 'available');
export const getComingSoonTools = () => TOOLS.filter(t => t.status === 'coming-soon');
export const getToolById = (id: string) => TOOLS.find(t => t.id === id);
