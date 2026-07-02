import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

// Import Dashboards
import AdminDashboard from '../admin/AdminDashboard';
import BranchManagerDashboard from '../branchManager/BranchManagerDashboard';
import MarketingDashboard from '../marketing/MarketingDashboard';
import SuperAdminDashboard from '../superAdmin/SuperAdminDashboard';

export default function DashboardScreen() {

    const { user } = useAuth();

    console.log('Logged User:', user);
    console.log('Role:', user?.role);

    switch (user?.role) {

        case 'super_admin':
            return <SuperAdminDashboard />;

        case 'admin':
            return <AdminDashboard />;

        case 'branch_manager':
            return <BranchManagerDashboard />;

        case 'marketing':
            return <MarketingDashboard />;

        default:
            return (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text>No Dashboard Found</Text>
                </View>
            );
    }
}