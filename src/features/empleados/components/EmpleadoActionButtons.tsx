import React from 'react';

interface ActionButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    title?: string;
    disabled?: boolean;
    className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, onClick, title, disabled, className }) => (
    <button
        type="button"
        className={`action-btn ${className || ''}`}
        onClick={onClick}
        title={title}
        disabled={disabled}
        style={{ width: '40px', display: 'flex', justifyContent: 'center', height: '40px', border: '1px solid #ddd', padding: 10 }}
    >
        {icon}
    </button>
);

export const ViewButton: React.FC<Omit<ActionButtonProps, 'icon'>> = props => (
    <ActionButton
        {...props}
        icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>}
        title={props.title || 'Ver'}
        className='bg-light'
    />
);

export const EditButton: React.FC<Omit<ActionButtonProps, 'icon'>> = props => (
    <ActionButton
        {...props}
        icon={<svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon-pencil"
        >
            <path stroke="#000" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
            <path stroke="#000" d="M20.71 7.04a1.003 1.003 0 0 0 0-1.41l-2.34-2.34a1.003 1.003 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>}
        title={props.title || 'Editar'}
        className='bg-light'
    />
);

export const DeleteButton: React.FC<Omit<ActionButtonProps, 'icon'>> = props => (
    <ActionButton
        {...props}
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
        </svg>}
        title={props.title || 'Dar de baja'}
        className='btn-sm btn-danger'
    />
);

export const ActivateButton: React.FC<Omit<ActionButtonProps, 'icon'>> = props => (
    <ActionButton
        {...props}
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            <path d="M10 11v6"></path>
            <path d="M14 11v6"></path>
        </svg>}
        title={props.title || 'Activar'}
        className='btn-sm btn-success'
    />
);
