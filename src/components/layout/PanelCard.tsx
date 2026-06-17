import { ReactNode } from 'react';

interface PanelCardProps {
  title: string;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function PanelCard({ title, icon, extra, children, className = '', footer }: PanelCardProps) {
  return (
    <div
      className={`relative bg-slate-900/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-transparent flex flex-col h-full overflow-hidden ${className}`}
      style={{
        borderImage: 'linear-gradient(to bottom, rgba(34,211,238,0.3), rgba(34,211,238,0.05) 30%, rgba(34,211,238,0.05) 70%, rgba(34,211,238,0.3)) 1',
      }}
    >
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-[3px] bg-cyan-400 rounded-sm"
            style={{ boxShadow: '0 0 6px rgba(34,211,238,0.8)' }}
          />
          {icon && <span className="flex items-center text-cyan-400">{icon}</span>}
          <h3 className="text-cyan-300 text-sm font-semibold tracking-wide">{title}</h3>
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      {footer && (
        <div className="mt-3 pt-3 border-t border-cyan-500/10 text-xs text-slate-400 shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}

export default PanelCard;
