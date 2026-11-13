import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../../components/GlassCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from '../../components/common/Icon';

export default function UniversitySubscriptionScreen({ onBack }) {
  const { theme: C } = useTheme();

  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [modalVisible, setModalVisible] = useState(false);
  const [collegeName, setCollegeName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pricingPlans = [
    {
      id: 'starter',
      name: 'College Starter',
      price: '₹4,999',
      period: '/month',
      badge: 'Small Institutes',
      badgeVariant: 'cyan',
      features: [
        'Up to 2,500 verified students',
        'Peer Course Notes & PDF Viewer',
        'Senior Doubt Resolution Forum',
        'Campus Events & Holiday Circulars',
        '1 Dedicated Faculty Admin Account'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'University Pro',
      price: '₹14,999',
      period: '/month',
      badge: 'MOST POPULAR',
      badgeVariant: 'gold',
      features: [
        'Unlimited verified student accounts',
        'All Features (Notes, Doubts, Teams, Market)',
        'Real-time Socket.IO 1-on-1 Chat',
        'Live Campus GPS Map & Pickup Points',
        'Department-wise Faculty Admin Roles',
        'Priority Technical Support (24/7)'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Custom White-Label',
      price: '₹29,999',
      period: '/month',
      badge: 'Full Ownership',
      badgeVariant: 'indigo',
      features: [
        'Dedicated Android App on Google Play Store',
        'Custom University Domain (e.g. portal.swaminarayan.edu)',
        'Custom College Theme & Logo Branding',
        'Full Database & Student Analytics Export',
        'Dedicated Cloud Hosting on AWS/Render'
      ],
      popular: false
    }
  ];

  const clientUniversities = [
    { name: 'Swaminarayan University, Kalol', status: 'Active (Flagship Campus)', students: '5,400+ Students', logo: '🏛️' },
    { name: 'Nirma University, Ahmedabad', status: 'Enterprise License', students: '8,200+ Students', logo: '🎓' },
    { name: 'Silver Oak University, Ahmedabad', status: 'Pro Plan', students: '6,100+ Students', logo: '⚡' },
    { name: 'Parul University, Vadodara', status: 'Enterprise License', students: '12,000+ Students', logo: '🏢' }
  ];

  const handleRequestLicense = () => {
    if (!collegeName.trim() || !officialEmail.trim() || !contactNumber.trim()) {
      Alert.alert('Required', 'Please fill in University Name, Official Email, and Contact Number.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setModalVisible(false);
      Alert.alert(
        'License Request Submitted 🎉',
        `Thank you ${adminName || 'Coordinator'}! Your request for "${selectedPlan.toUpperCase()} Plan" for ${collegeName} has been received. Our CampusConnect sales team will activate your university portal within 24 hours.`
      );
      setCollegeName('');
      setOfficialEmail('');
      setContactNumber('');
    }, 800);
  };

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: C.navBg, borderBottomColor: C.border }]}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
            <Icon name="arrow-left" size={18} color={C.textPrimary} />
          </TouchableOpacity>
        ) : null}
        <View style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}>
          <Text style={[styles.headerTitle, { color: C.textPrimary }]}>💼 Multi-University SaaS</Text>
          <Text style={[styles.headerSub, { color: C.textMuted }]}>Commercial licensing for colleges & institutions</Text>
        </View>
        <Button
          title="Get License"
          size="sm"
          onPress={() => setModalVisible(true)}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <GlassCard topAccent={C.amber} style={styles.bannerCard}>
          <Text style={[styles.bannerTag, { color: C.amber }]}>🚀 MULTI-TENANT SAAS LICENSING</Text>
          <Text style={[styles.bannerTitle, { color: C.textPrimary }]}>
            Launch CampusConnect for Your Institution
          </Text>
          <Text style={[styles.bannerSub, { color: C.textMuted }]}>
            Colleges across Gujarat and India can subscribe to this platform to digitize course notes, campus circulars, hackathons, and student commerce.
          </Text>
        </GlassCard>

        {/* Pricing Plans */}
        <Text style={[styles.sectionHeading, { color: C.textPrimary }]}>📦 Licensing & Pricing Plans</Text>
        <View style={styles.plansGrid}>
          {pricingPlans.map((plan) => (
            <GlassCard
              key={plan.id}
              topAccent={plan.popular ? C.primary : C.border}
              style={[styles.planCard, plan.popular && { borderColor: C.primary }]}
            >
              <View style={styles.planHeader}>
                <Badge label={plan.badge} variant={plan.popular ? 'primary' : 'neutral'} />
              </View>

              <Text style={[styles.planName, { color: C.textPrimary }]}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceAmount, { color: C.textPrimary }]}>{plan.price}</Text>
                <Text style={[styles.pricePeriod, { color: C.textMuted }]}>{plan.period}</Text>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Icon name="check" size={13} color={C.emerald} style={{ marginRight: 8 }} />
                    <Text style={[styles.featureText, { color: C.textSecondary }]}>{feat}</Text>
                  </View>
                ))}
              </View>

              <Button
                title={plan.popular ? 'Select Pro Plan →' : 'Choose Plan'}
                variant={plan.popular ? 'primary' : 'outline'}
                onPress={() => {
                  setSelectedPlan(plan.id);
                  setModalVisible(true);
                }}
                style={{ marginTop: 16 }}
              />
            </GlassCard>
          ))}
        </View>

        {/* Active Client Universities */}
        <Text style={[styles.sectionHeading, { color: C.textPrimary }]}>🏛️ Active CampusConnect Partner Campuses</Text>
        <View style={styles.clientGrid}>
          {clientUniversities.map((uni, idx) => (
            <GlassCard key={idx} topAccent={C.emerald} style={styles.clientCard}>
              <View style={[styles.clientIconBox, { backgroundColor: C.emeraldLight }]}>
                <Text style={{ fontSize: 20 }}>{uni.logo}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.clientName, { color: C.textPrimary }]}>{uni.name}</Text>
                <Text style={[styles.clientStatus, { color: C.textMuted }]}>{uni.status} • {uni.students}</Text>
              </View>
              <Badge label="ACTIVE" variant="success" />
            </GlassCard>
          ))}
        </View>
      </ScrollView>

      {/* Request License Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={[styles.modalBg, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <View style={[styles.modalCard, { backgroundColor: C.bgCard, borderColor: C.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.textPrimary }]}>Request University License</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.75}>
                <Icon name="x" size={20} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Input label="University / College Name *" placeholder="e.g. Nirma / Charusat / Silver Oak" value={collegeName} onChangeText={setCollegeName} />
              <Input label="Contact Person / HOD Name" placeholder="Prof. Jayesh Patel" value={adminName} onChangeText={setAdminName} />
              <Input label="Official College Email *" placeholder="principal@college.edu.in" keyboardType="email-address" value={officialEmail} onChangeText={setOfficialEmail} autoCapitalize="none" />
              <Input label="Phone / WhatsApp Number *" placeholder="+91 98765 43210" keyboardType="phone-pad" value={contactNumber} onChangeText={setContactNumber} />
              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Submit Request" onPress={handleRequestLicense} loading={submitting} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  content: { padding: 16, paddingBottom: 90 },
  bannerCard: { padding: 18, marginBottom: 18 },
  bannerTag: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 },
  bannerTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6, lineHeight: 23 },
  bannerSub: { fontSize: 13, lineHeight: 19 },
  sectionHeading: { fontSize: 16, fontWeight: '700', marginVertical: 14 },
  plansGrid: { gap: 12 },
  planCard: { padding: 18 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 14 },
  priceAmount: { fontSize: 24, fontWeight: '800' },
  pricePeriod: { fontSize: 13, marginLeft: 4 },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureText: { fontSize: 13, flex: 1, lineHeight: 18 },
  clientGrid: { gap: 8 },
  clientCard: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  clientIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clientName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  clientStatus: { fontSize: 11 },
  modalBg: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalActions: { flexDirection: 'row', marginTop: 8, marginBottom: 20 }
});
