import React from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';

interface MenuHeaderProps {
  mode?: 'horizontal' | 'inline';
  className?: string; // Cho phép truyền class từ ngoài vào
}

const items: MenuProps['items'] = [
  {
    label: 'HOME',
    key: 'home',
    children: [
      { label: 'Main Home', key: 'main-home' },
      { label: 'Bookstore', key: 'bookstore' },
    ],
  },
  {
    label: 'PAGES',
    key: 'pages',
    children: [
      { label: 'About Us', key: 'about' },
      { label: 'Contact', key: 'contact' },
    ],
  },
  { label: 'EVENTS', key: 'events' },
  { label: 'BLOG', key: 'blog' },
  { label: 'SHOP', key: 'shop' },
];

const MenuHeader: React.FC<MenuHeaderProps> = ({ mode = 'horizontal', className = '' }) => {
  return (
    <Menu
      mode={mode}
      items={items}
      // Tailwind classes:
      // - !border-b-0: Xóa gạch chân mặc định của Antd
      // - bg-transparent: Xóa màu nền
      // - text-sm, tracking-wide: Font chữ giống mẫu
      // - justify-center: Căn giữa items (khi mode horizontal)
      className={`!bg-transparent !border-0 text-sm font-medium tracking-wide justify-center ${className}`  }
    />
  );
};

export default MenuHeader;