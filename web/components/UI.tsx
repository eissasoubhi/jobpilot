import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'blue' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

type ButtonTone = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'default' | 'small';

export function Button({
  children,
  tone = 'primary',
  size = 'default',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone; size?: ButtonSize }) {
  const toneClass = tone === 'primary' ? '' : tone;
  const sizeClass = size === 'small' ? 'small' : '';
  const classes = ['btn', toneClass, sizeClass, className].filter(Boolean).join(' ');

  return <button type={type} className={classes} {...props}>{children}</button>;
}

export function AiSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`jp-ai-surface ${className}`.trim()}>{children}</section>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function Loading({ label = 'Chargement…' }: { label?: string }) {
  return <div className="loading" role="status" aria-live="polite">{label}</div>;
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="error-box" role="alert">{message}</div>;
}
