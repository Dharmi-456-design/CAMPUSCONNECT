import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../store/authStore';
import Icon from '../components/common/Icon';

const LEADERBOARD_TABS = ['Monthly Ranking', 'All-Time Legends', 'SSIT Computer Engg.'];

const PODIUM = [
  {
    rank: 2,
    name: 'Harsh Shah',
    department: 'Computer Engg. • Sem 5',
    credits: 1120,
    streak: '12 Days 🔥',
    notes: 12,
    badge: 'SILVER SCHOLAR 🥈',
    badgeColor: '#CBD5E1',
    avatarBg: '#475569',
    height: 140,
  },
  {
    rank: 1,
    name: 'Dharmi Patel',
    department: 'Computer Engg. • Sem 3',
    credits: 1450,
    streak: '14 Days 🔥',
    notes: 14,
    badge: 'CHAMPION 👑',
    badgeColor: '#F59E0B',
    avatarBg: '#D97706',
    height: 175,
    isCurrentUser: true,
  },
  {
    rank: 3,
    name: 'Ananya Sharma',
    department: 'Pharmacy • Sem 3',
    credits: 980,
    streak: '8 Days 🔥',
    notes: 9,
    badge: 'BRONZE SCHOLAR 🥉',
    badgeColor: '#D97706',
    avatarBg: '#78350F',
    height: 120,
  },
];

const LEADERBOARD_LIST = [
  { rank: 4, name: 'Rahul Mehta', branch: 'Computer Engg. • Sem 3', credits: 890, notes: 8, doubts: 6, streak: '7 Days' },
  { rank: 5, name: 'Priya Desai', branch: 'IT & BCA • Sem 5', credits: 820, notes: 10, doubts: 4, streak: '6 Days' },
  { rank: 6, name: 'Vikram Patel', branch: 'Mechanical Engg. • Sem 5', credits: 760, notes: 6, doubts: 5, streak: '5 Days' },
  { rank: 7, name: 'Sneha Verma', branch: 'Pharmacy • Sem 3', credits: 710, notes: 7, doubts: 3, streak: '4 Days' },
  { rank: 8, name: 'Rohan Gupta', branch: 'Civil Engg. • Sem 7', credits: 680, notes: 4, doubts: 4, streak: '3 Days' },
  { rank: 9, name: 'Kavya Trivedi', branch: 'Ayurvedic Science • Sem 3', credits: 640, notes: 5, doubts: 2, streak: '3 Days' },
  { rank: 10, name: 'Aarav Joshi', branch: 'Management (MBA) • Sem 1', credits: 590, notes: 3, doubts: 3, streak: '2 Days' },
];

const BADGES_COLLECTION = [
  { id: 'b1', title: 'Champion Scholar', desc: 'Top 1 Rank on Swaminarayan Campus', icon: 'crown', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', unlocked: true },
  { id: 'b2', title: 'Streak Master', desc: 'Maintained 10+ consecutive study days', icon: 'zap', color: '#10B981', bg: 'rgba(16,185,129,0.15)', unlocked: true },
  { id: 'b3', title: 'Knowledge Donor', desc: 'Uploaded 10+ verified study notes', icon: 'book-open', color: '#16A36A', bg: 'rgba(201,168,76,0.15)', unlocked: true },
  { id: 'b4', title: 'Doubt Buster', desc: 'Solved 5+ student questions in Q&A', icon: 'help-circle', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)', unlocked: true },
  { id: 'b5', title: 'Hackathon Lead', desc: 'Created an SIH 2026 project squad', icon: 'award', color: '#EC4899', bg: 'rgba(236,72,153,0.15)', unlocked: true },
];

const MONTHLY_REWARDS = [
  { rank: '🥇 Rank 1', prize: '₹2,000 Amazon Voucher + Free Canteen Coffee Pass + Library Priority Pass' },
  { rank: '🥈 Rank 2 - 3', prize: '₹1,000 Voucher + Swaminarayan University Certificate of Academic Excellence' },
  { rank: '🥉 Rank 4 - 10', prize: '200 Bonus Campus Credits + CampusOne Official Merch Badge' },
];

export default function LeaderboardScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [activeTab, setActiveTab] = useState('Campus Wide');

  const bgCard = theme.bgCard;
  const border = theme.border;
  const textTitle = theme.textPrimary;
  const textSub = theme.textMuted;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.scrollInner}
      showsVerticalScrollIndicator={false}
    >
      {/* ======================================================== */}
      {/* 1. HEADER ROW                                             */}
      {/* ======================================================== */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.pageTitle, { color: textTitle }]}>
            Campus Leaderboard 🏆
          </Text>
          <Text style={[styles.pageSub, { color: textSub }]}>
            Recognizing top student scholars, contributors & leaders.
          </Text>
        </View>

        <View style={styles.tabContainer}>
          {LEADERBOARD_TABS.map((t) => {
            const isSel = activeTab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tabBtn,
                  {
                    backgroundColor: isSel ? '#16A36A' : bgCard,
                    borderColor: isSel ? '#16A36A' : border,
                  },
                ]}
                onPress={() => setActiveTab(t)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, { color: isSel ? '#0c0f10' : textSub, fontWeight: isSel ? '700' : '600' }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. PODIUM STAND (Top 3 Scholars)                         */}
      {/* ======================================================== */}
      <View style={[styles.podiumSection, { backgroundColor: bgCard, borderColor: border }]}>
        <Text style={[styles.podiumHeading, { color: textTitle }]}>👑 Monthly Hall of Fame</Text>
        <Text style={[styles.podiumSub, { color: textSub }]}>Updated live based on Campus Credits & Peer Contributions</Text>

        <View style={styles.podiumRow}>
          {/* Rank 2 (Silver) */}
          <View style={styles.podiumCol}>
            <View style={[styles.podiumAvatarCircle, { backgroundColor: PODIUM[0].avatarBg }]}>
              <Text style={styles.avatarLetter}>H</Text>
            </View>
            <Text style={[styles.podiumName, { color: textTitle }]}>{PODIUM[0].name}</Text>
            <Text style={[styles.podiumDept, { color: textSub }]}>{PODIUM[0].department}</Text>
            <View style={[styles.podiumBadgePill, { backgroundColor: 'rgba(203,213,225,0.15)' }]}>
              <Text style={{ color: '#CBD5E1', fontSize: 10.5, fontWeight: '800' }}>{PODIUM[0].badge}</Text>
            </View>

            <View style={[styles.podiumStand, { height: 110, backgroundColor: isDark ? '#141D2D' : '#E2E8F0', borderColor: border }]}>
              <Text style={[styles.podiumRankText, { color: '#94A3B8' }]}>2</Text>
              <Text style={[styles.podiumCreditsText, { color: textTitle }]}>{PODIUM[0].credits} pts</Text>
            </View>
          </View>

          {/* Rank 1 (Gold Champion) */}
          <View style={styles.podiumCol}>
            <View style={styles.crownGlow}>
              <Text style={{ fontSize: 24 }}>👑</Text>
            </View>
            <View style={[styles.podiumAvatarCircle, { backgroundColor: PODIUM[1].avatarBg, borderWidth: 3, borderColor: '#F59E0B' }]}>
              <Text style={styles.avatarLetter}>D</Text>
            </View>
            <Text style={[styles.podiumName, { color: textTitle, fontWeight: '900' }]}>{PODIUM[1].name}</Text>
            <Text style={[styles.podiumDept, { color: textSub }]}>{PODIUM[1].department}</Text>
            <View style={[styles.podiumBadgePill, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
              <Text style={{ color: '#FBBF24', fontSize: 11, fontWeight: '800' }}>{PODIUM[1].badge}</Text>
            </View>

            <View style={[styles.podiumStand, { height: 145, backgroundColor: isDark ? 'rgba(201, 168, 76, 0.25)' : '#E8F5EE', borderColor: '#16A36A' }]}>
              <Text style={[styles.podiumRankText, { color: '#F59E0B' }]}>1</Text>
              <Text style={[styles.podiumCreditsText, { color: isDark ? '#16A36A' : '#16A36A', fontWeight: '900' }]}>{PODIUM[1].credits} pts</Text>
            </View>
          </View>

          {/* Rank 3 (Bronze) */}
          <View style={styles.podiumCol}>
            <View style={[styles.podiumAvatarCircle, { backgroundColor: PODIUM[2].avatarBg }]}>
              <Text style={styles.avatarLetter}>A</Text>
            </View>
            <Text style={[styles.podiumName, { color: textTitle }]}>{PODIUM[2].name}</Text>
            <Text style={[styles.podiumDept, { color: textSub }]}>{PODIUM[2].department}</Text>
            <View style={[styles.podiumBadgePill, { backgroundColor: 'rgba(217,119,6,0.15)' }]}>
              <Text style={{ color: '#D97706', fontSize: 10.5, fontWeight: '800' }}>{PODIUM[2].badge}</Text>
            </View>

            <View style={[styles.podiumStand, { height: 95, backgroundColor: isDark ? '#141D2D' : '#E2E8F0', borderColor: border }]}>
              <Text style={[styles.podiumRankText, { color: '#D97706' }]}>3</Text>
              <Text style={[styles.podiumCreditsText, { color: textTitle }]}>{PODIUM[2].credits} pts</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. YOUR CURRENT RANKING BANNER                           */}
      {/* ======================================================== */}
      <View style={styles.userRankCard}>
        <View style={styles.userRankGlow} />
        <View style={styles.userRankLeft}>
          <View style={styles.userRankBadge}>
            <Text style={styles.userRankNum}>#1</Text>
          </View>
          <View>
            <Text style={styles.userRankTitle}>You are currently Rank #1 on Campus! 🎉</Text>
            <Text style={styles.userRankSub}>Dharmi Patel • 1,450 Campus Credits • 14 Day Streak 🔥</Text>
          </View>
        </View>
        <View style={styles.tierPill}>
          <Text style={styles.tierPillText}>💎 DIAMOND SCHOLAR</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. TWO-COLUMN GRID: Leaderboard List + Badges & Perks    */}
      {/* ======================================================== */}
      <View style={[styles.splitGrid, isDesktop && styles.splitGridDesktop]}>
        {/* LEFT COLUMN: Leaderboard Ranks 4-10 */}
        <View style={styles.leftCol}>
          <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.sectionTitle, { color: textTitle }]}>Top Campus Contributors</Text>
              <Text style={[styles.sectionSub, { color: textSub }]}>Ranks #4 to #10</Text>
            </View>

            <View style={styles.rankList}>
              {LEADERBOARD_LIST.map((item) => (
                <View key={item.rank} style={[styles.rankItem, { borderBottomColor: border }]}>
                  <View style={[styles.rankBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9' }]}>
                    <Text style={[styles.rankNumText, { color: textTitle }]}>#{item.rank}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rankName, { color: textTitle }]}>{item.name}</Text>
                    <Text style={[styles.rankBranch, { color: textSub }]}>{item.branch}</Text>
                  </View>

                  <View style={styles.rankStatsCol}>
                    <Text style={[styles.rankCredits, { color: isDark ? '#16A36A' : '#16A36A' }]}>{item.credits} pts</Text>
                    <Text style={[styles.rankDetails, { color: textSub }]}>
                      {item.notes} Notes • {item.streak} 🔥
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN: Badges & Rewards */}
        <View style={styles.rightCol}>
          {/* BADGES GALLERY */}
          <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: textTitle, marginBottom: 12 }]}>
              🎖️ My Achievement Badges
            </Text>

            <View style={styles.badgesGrid}>
              {BADGES_COLLECTION.map((b) => (
                <View key={b.id} style={[styles.badgeCard, { backgroundColor: isDark ? '#141D2D' : '#F8FAFC', borderColor: border }]}>
                  <View style={[styles.badgeIconBox, { backgroundColor: b.bg }]}>
                    <Icon name={b.icon} size={16} color={b.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.badgeTitle, { color: textTitle }]}>{b.title}</Text>
                    <Text style={[styles.badgeDesc, { color: textSub }]}>{b.desc}</Text>
                  </View>
                  <Icon name="check-circle" size={14} color="#10B981" />
                </View>
              ))}
            </View>
          </View>

          {/* MONTHLY REWARDS */}
          <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: textTitle, marginBottom: 12 }]}>
              🎁 Monthly Rewards & Perks
            </Text>

            <View style={styles.rewardsList}>
              {MONTHLY_REWARDS.map((r, i) => (
                <View key={i} style={[styles.rewardItem, { borderBottomColor: border }]}>
                  <Text style={[styles.rewardRank, { color: textTitle }]}>{r.rank}</Text>
                  <Text style={[styles.rewardPrize, { color: textSub }]}>{r.prize}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollInner: { padding: 22, paddingBottom: 40 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
    flexWrap: 'wrap',
    gap: 12,
  },
  pageTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  pageSub: { fontSize: 13, marginTop: 3 },
  tabContainer: { flexDirection: 'row', gap: 8 },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  tabBtnText: { fontSize: 12, fontWeight: '600' },

  /* Podium */
  podiumSection: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 22,
    marginBottom: 20,
    alignItems: 'center',
  },
  podiumHeading: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  podiumSub: { fontSize: 12, marginBottom: 24 },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    maxWidth: 550,
  },
  podiumCol: { alignItems: 'center', flex: 1 },
  crownGlow: { marginBottom: -6 },
  podiumAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarLetter: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  podiumName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  podiumDept: { fontSize: 10, textAlign: 'center', marginBottom: 6 },
  podiumBadgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 10 },
  podiumStand: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  podiumRankText: { fontSize: 24, fontWeight: '900' },
  podiumCreditsText: { fontSize: 12, fontWeight: '700' },

  /* User Rank Card */
  userRankCard: {
    backgroundColor: '#16140d',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#16A36A',
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    flexWrap: 'wrap',
    gap: 12,
  },
  userRankGlow: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201,168,76,0.22)',
  },
  userRankLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  userRankBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRankNum: { color: '#0c0f10', fontSize: 18, fontWeight: '900' },
  userRankTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  userRankSub: { color: '#e6ded0', fontSize: 11.5, marginTop: 2 },
  tierPill: { backgroundColor: 'rgba(201,168,76,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#16A36A' },
  tierPillText: { color: '#16A36A', fontSize: 11, fontWeight: '800' },

  /* Two Column Split */
  splitGrid: { flexDirection: 'column', gap: 20 },
  splitGridDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  leftCol: { flex: 1.3 },
  rightCol: { flex: 1, gap: 18 },

  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  cardHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  sectionSub: { fontSize: 11.5, marginTop: 2 },

  rankList: { gap: 10 },
  rankItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  rankBadge: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rankNumText: { fontSize: 12.5, fontWeight: '800' },
  rankName: { fontSize: 13, fontWeight: '700' },
  rankBranch: { fontSize: 11, marginTop: 1 },
  rankStatsCol: { alignItems: 'flex-end' },
  rankCredits: { fontSize: 13, fontWeight: '800' },
  rankDetails: { fontSize: 10.5, marginTop: 1 },

  badgesGrid: { gap: 10 },
  badgeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, gap: 12 },
  badgeIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  badgeTitle: { fontSize: 12.5, fontWeight: '700' },
  badgeDesc: { fontSize: 10.5, marginTop: 1 },

  rewardsList: { gap: 10 },
  rewardItem: { paddingVertical: 8, borderBottomWidth: 1 },
  rewardRank: { fontSize: 12.5, fontWeight: '800', marginBottom: 2 },
  rewardPrize: { fontSize: 11.5, lineHeight: 16 },
});
