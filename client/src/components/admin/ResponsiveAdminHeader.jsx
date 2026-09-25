import React from 'react';
import DashboardNavbar from '../navigation/DashboardNavbar';

const ResponsiveAdminHeader = ({
  title = 'Overview',
  subtitle,
  onMobileMenuToggle,
  ...props
}) => {
  return (
    <DashboardNavbar
      title={title}
      subtitle={subtitle}
      role="admin"
      showSearch={true}
      showNotifications={true}
      showProfile={true}
      {...props}
    />
  );
};

export default ResponsiveAdminHeader;
