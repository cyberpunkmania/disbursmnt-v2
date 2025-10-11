import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend
}) => {
  const { isDarkMode } = useTheme();

  const getColorClass = (color: string) => {
    switch (color) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      case 'info': return 'text-info';
      default: return 'text-primary';
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      default: return 'text-muted';
    }
  };

  return (
    <div className="col-xl-3 col-md-6">
      <div className={`card h-100 ${isDarkMode ? 'bg-dark border-secondary' : ''}`}>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h6 className="card-subtitle mb-2 text-muted">{title}</h6>
              <h2 className={`card-title mb-0 ${getColorClass(color)}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h2>
              {subtitle && (
                <small className="text-muted">{subtitle}</small>
              )}
              {trend && (
                <div className={`small mt-1 ${getTrendColor(trend.direction)}`}>
                  {trend.value}
                </div>
              )}
            </div>
            <div className={`${getColorClass(color)} opacity-75`}>
              <Icon size={36} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICard;