import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

export const Message = ({ className, from, ...props }) => (
  <div
    dir="ltr"
    style={{
      display: 'flex',
      width: '100%',
      alignItems: 'flex-start',
      justifyContent: from === 'user' ? 'flex-end' : 'flex-start',
      gap: '12px',
      padding: '16px 0',
    }}
    className={className}
    {...props}
  />
);

export const MessageContent = ({ children, className, from, ...props }) => (
  <div
    dir="auto"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      borderRadius: '20px',
      fontSize: '15px',
      lineHeight: '1.6',
      padding: from === 'user' ? '12px 20px' : '0',
      maxWidth: from === 'user' ? '70%' : '100%',
      backgroundColor: from === 'user' ? '#f3f4f6' : 'transparent',
      color: from === 'user' ? '#111827' : '#1e293b',
      border: 'none',
      borderBottomRightRadius: from === 'user' ? '4px' : '20px',
      flex: from === 'assistant' ? 1 : 'unset',
      minWidth: 0,
    }}
    className={className}
    {...props}
  >
    {children}
  </div>
);

export const MessageAvatar = ({ src, name, className, ...props }) => (
  <Avatar
    style={{ width: '36px', height: '36px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexShrink: 0, background: '#fff' }}
    className={className}
    {...props}
  >
    <AvatarImage alt={name} style={{ margin: 0, objectFit: 'cover' }} src={src} />
    <AvatarFallback style={{ fontSize: '13px', background: '#f8fafc', color: '#475569', fontWeight: 600 }}>{name?.slice(0, 2) || 'AI'}</AvatarFallback>
  </Avatar>
);
