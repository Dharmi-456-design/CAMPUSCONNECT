import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Icon from '../../components/common/Icon';
import { getAdminAnalyticsApi, getAdminReportsApi, updateReportStatusApi } from '../../api/admin.api';

export default function AdminDashboardScreen() {
  const { theme: C } = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, reportsRes] = await Promise.all([
        getAdminAnalyticsApi(),
        getAdminReportsApi({ status: 'pending' })
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (reportsRes.success) setReports(reportsRes.data.reports || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleResolveReport = async (reportId, status) => {
    try {
      const res = await updateReportStatusApi(reportId, status);
      if (res.success) {
        Alert.alert('Report Updated', `Report marked as ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading && !refreshing) {
    return <Loader message="Fetching admin analytics & reports..." />;
  }

  const kpis = [
    { label: 'Total Users', value: analytics?.counts?.totalUsers || 0, color: C.primary, icon: 'users' },
    { label: 'Notes Uploaded', value: analytics?.counts?.totalNotes || 0, color: C.amber, icon: 'book-open' },
    { label: 'Doubts Asked', value: analytics?.counts?.totalDoubts || 0, color: C.cyan, icon: 'help-circle' },
    { label: 'Marketplace Items', value: analytics?.counts?.totalListings || 0, color: C.emerald, icon: 'shopping-bag' }
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: C.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchAdminData} tintColor={C.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: C.navBg, borderBottomColor: C.border }]}>
        <Text style={[styles.title, { color: C.textPrimary }]}>🛡️ Admin Moderation Center</Text>
        <Text style={[styles.subtitle, { color: C.textMuted }]}>Platform telemetry & content moderation</Text>
      </View>

      <View style={styles.body}>
        {/* KPI Stats Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <GlassCard key={idx} topAccent={kpi.color} style={styles.kpiCard}>
              <View style={[styles.kpiIconBox, { backgroundColor: kpi.color + '18' }]}>
                <Icon name={kpi.icon} size={18} color={kpi.color} />
              </View>
              <Text style={[styles.kpiValue, { color: C.textPrimary }]}>{kpi.value}</Text>
              <Text style={[styles.kpiLabel, { color: C.textMuted }]}>{kpi.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Moderation Queue */}
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
          🚨 Pending Moderation Reports ({reports.length})
        </Text>

        {reports.length > 0 ? (
          reports.map((report) => (
            <GlassCard key={report._id} topAccent={C.rose} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Badge label={report.targetType?.toUpperCase() || 'CONTENT'} variant="danger" />
                <Text style={[styles.reporterName, { color: C.textDim }]}>
                  Reported by {report.reporter?.name || 'Student'}
                </Text>
              </View>
              <Text style={[styles.reportReason, { color: C.textPrimary }]}>
                Reason: {report.reason}
              </Text>
              <View style={styles.actionRow}>
                <Button
                  title="Mark Reviewed"
                  onPress={() => handleResolveReport(report._id, 'reviewed')}
                  style={{ flex: 1, marginRight: 8 }}
                  size="sm"
                />
                <Button
                  title="Dismiss"
                  onPress={() => handleResolveReport(report._id, 'dismissed')}
                  variant="outline"
                  style={{ flex: 1 }}
                  size="sm"
                />
              </View>
            </GlassCard>
          ))
        ) : (
          <GlassCard style={{ padding: 20 }}>
            <Text style={[styles.cleanQueueText, { color: C.emerald }]}>
              🎉 All clear! No pending moderation reports in queue.
            </Text>
          </GlassCard>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },
  body: { padding: 16, paddingBottom: 90 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  kpiCard: { flex: 1, minWidth: '46%', padding: 14, alignItems: 'center' },
  kpiIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  kpiValue: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  kpiLabel: { fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  reportCard: { marginBottom: 12, padding: 16 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reporterName: { fontSize: 11 },
  reportReason: { fontSize: 13, marginBottom: 14, lineHeight: 18 },
  actionRow: { flexDirection: 'row' },
  cleanQueueText: { textAlign: 'center', fontWeight: '600', fontSize: 14 }
});
