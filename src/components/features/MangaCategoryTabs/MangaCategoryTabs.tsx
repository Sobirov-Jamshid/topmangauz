"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface MangaCategoryTabsProps {
  categories: {
    id: string;
    name: string;
    count?: number;
  }[];
}

function MangaCategoryTabsContent({ categories }: MangaCategoryTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-1 border-b border-border min-w-max">
        <TabItem 
          name="Все" 
          href={pathname}
          isActive={currentCategory === 'all'} 
        />
        
        {categories.map(category => (
          <TabItem 
            key={category.id}
            name={category.name}
            count={category.count}
            href={`${pathname}?category=${category.id}`}
            isActive={currentCategory === category.id}
          />
        ))}
      </div>
    </div>
  );
}

interface TabItemProps {
  name: string;
  href: string;
  isActive?: boolean;
  count?: number;
}

const TabItem = ({ name, href, isActive, count }: TabItemProps) => (
  <Link
    href={href}
    className={`px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition-colors flex items-center
      ${isActive 
        ? 'border-primary text-primary' 
        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30'
      }`}
  >
    {name}
    {count !== undefined && (
      <span className={`ml-1.5 text-xs py-0.5 px-1.5 rounded-full ${isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
        {count}
      </span>
    )}
  </Link>
);

const MangaCategoryTabs = (props: MangaCategoryTabsProps) => {
  return (
    <Suspense fallback={
      <div className="overflow-x-auto">
        <div className="flex space-x-1 border-b border-border min-w-max">
          <div className="px-4 py-3 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
          <div className="px-4 py-3 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
          <div className="px-4 py-3 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
        </div>
      </div>
    }>
      <MangaCategoryTabsContent {...props} />
    </Suspense>
  );
};

export default MangaCategoryTabs; 