import React from 'react';
import Layout from '../components/Layout';
import StudentProfileView from '../components/profile/StudentProfileView';

const Profile = () => {
  return (
    <Layout
      title="Student Profile"
      subtitle="Institutional academic records and personalized study preferences"
      showSearch={true}
      showNotifications={true}
      showProfile={true}
    >
      <StudentProfileView isEmbedded={false} />
    </Layout>
  );
};

export default Profile;
