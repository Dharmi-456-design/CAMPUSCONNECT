import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Icon from '../../components/common/Icon';
import APP_CONFIG from '../../constants/config';

export default function ApkDownloadScreen({ onBack }) {
  const { theme, isDark } = useTheme();
  const [downloading, setDownloading] = useState(false);

  const apkUrl = APP_CONFIG.APK_DOWNLOAD_URL;
  const githubUrl = APP_CONFIG.GITHUB_REPO_URL;
  const version = APP_CONFIG.APP_VERSION;
  const devInfo = APP_CONFIG.DEVELOPER_INFO;

  const handleDownloadApk = async () => {
    if (!apkUrl || !apkUrl.trim() || apkUrl.includes('YOUR_') || apkUrl.length < 10) {
      Alert.alert(
        'APK Unavailable',
        'APK download URL is currently not configured. Please contact the administrator or check the GitHub repository releases.'
      );
      return;
    }

    try {
      setDownloading(true);
      const supported = await Linking.canOpenURL(apkUrl);
      if (supported || Platform.OS === 'web') {
        await Linking.openURL(apkUrl);
      } else {
        // Fallback for custom schemes
        await Linking.openURL(apkUrl);
      }
    } catch (err) {
      Alert.alert(
        'Download Error',
        'Could not open download link automatically. Please verify your internet connection or open the repository link below.'
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenGitHub = async () => {
    if (!githubUrl) {
      Alert.alert('Unavailable', 'GitHub repository URL is not configured.');
      return;
    }
    try {
      await Linking.openURL(githubUrl);
    } catch (err) {
      Alert.alert('Error', 'Unable to open GitHub repository.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B0F19' : '#F8FAFC' }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderBottomColor: isDark ? '#334155' : '#F1F5F9',
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Icon name="arrow-left" size={20} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Android Download
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
      >
        {/* Main APK Download Card matching exact specifications */}
        <View
          style={[
            styles.downloadCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          {/* Logo / Device Preview Icon */}
          <View style={styles.iconBox}>
            <Icon name="smartphone" size={38} color="#16A36A" />
          </View>

          {/* EXACT SPECIFICATION: Display: "CampusOne – Android Application" */}
          <Text style={[styles.cardTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            CampusOne – Android Application
          </Text>

          {/* EXACT SPECIFICATION: "Download the latest Android APK." */}
          <Text style={styles.cardSubtitle}>
            Download the latest Android APK.
          </Text>

          {/* EXACT SPECIFICATION: Button: "Download APK" */}
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && { opacity: 0.7 }]}
            onPress={handleDownloadApk}
            disabled={downloading}
            activeOpacity={0.85}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="download" size={20} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download APK</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Below the button specifications */}
          <View
            style={[
              styles.metaContainer,
              {
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            {/* 1. Application version */}
            <View style={styles.metaRow}>
              <View style={styles.metaLabelRow}>
                <Icon name="info" size={14} color="#16A36A" />
                <Text style={styles.metaLabel}>Application version:</Text>
              </View>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                v{version} (Release 2026.1)
              </Text>
            </View>

            <View style={styles.divider} />

            {/* 2. GitHub repository */}
            <View style={styles.metaRow}>
              <View style={styles.metaLabelRow}>
                <Icon name="github" size={14} color="#16A36A" />
                <Text style={styles.metaLabel}>GitHub repository:</Text>
              </View>
              <TouchableOpacity onPress={handleOpenGitHub} style={styles.githubLinkBtn}>
                <Text style={styles.githubLinkText} numberOfLines={1}>
                  Dharmi-456-design/CAMPUSCONNECT
                </Text>
                <Icon name="external-link" size={13} color="#16A36A" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* 3. Developer/project information */}
            <View style={styles.metaRow}>
              <View style={styles.metaLabelRow}>
                <Icon name="user" size={14} color="#16A36A" />
                <Text style={styles.metaLabel}>Developer / Project:</Text>
              </View>
              <Text
                style={[
                  styles.metaValue,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}
              >
                {devInfo}
              </Text>
            </View>
          </View>
        </View>

        {/* Installation Instructions */}
        <View
          style={[
            styles.instructionsCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}
        >
          <Text style={[styles.instructionsTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            How to Install
          </Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: isDark ? '#94A3B8' : '#475569' }]}>
              Tap the <Text style={{ fontWeight: '700' }}>Download APK</Text> button above to open the file.
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: isDark ? '#94A3B8' : '#475569' }]}>
              If prompted, allow your mobile browser or file manager to install applications from unknown sources.
            </Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: isDark ? '#94A3B8' : '#475569' }]}>
              Open CampusOne, sign in with your student credentials and start exploring!
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  downloadCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  downloadBtn: {
    backgroundColor: '#16A36A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    width: '100%',
    shadowColor: '#16A36A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaContainer: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'column',
    gap: 4,
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 20,
  },
  githubLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 20,
  },
  githubLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A36A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  instructionsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16A36A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
