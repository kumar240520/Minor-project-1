import React from 'react';
import DashboardNavbar from './navigation/DashboardNavbar';

const ResponsiveHeader = ({
  title = 'Overview',
  subtitle,
  role = 'student',
  showSearch = true,
  showNotifications = true,
  showProfile = true,
  ...props
}) => {
  return (
    <DashboardNavbar
      title={title}
      subtitle={subtitle}
      role={role}
      showSearch={showSearch}
      showNotifications={showNotifications}
      showProfile={showProfile}
      {...props}
    />
  );
};

export default ResponsiveHeader;
