import React from 'react';

// Card component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`card ${className || ''}`} {...props} />;
  }
);
Card.displayName = 'Card';

// CardHeader component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`card-header ${className || ''}`} {...props} />;
  }
);
CardHeader.displayName = 'CardHeader';

// CardTitle component
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return <h3 ref={ref} className={`card-title ${className || ''}`} {...props} />;
  }
);
CardTitle.displayName = 'CardTitle';

// CardDescription component
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={`card-description ${className || ''}`} {...props} />;
  }
);
CardDescription.displayName = 'CardDescription';

// CardContent component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`card-content ${className || ''}`} {...props} />;
  }
);
CardContent.displayName = 'CardContent';

// CardFooter component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={`card-footer ${className || ''}`} {...props} />;
  }
);
CardFooter.displayName = 'CardFooter';
